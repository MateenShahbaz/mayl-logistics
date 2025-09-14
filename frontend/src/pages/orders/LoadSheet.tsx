import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { DatePicker, Table } from "antd";
import { apiCaller } from "../../core/API/ApiServices";
import Badge from "../../components/ui/badge/Badge";
import { Link } from "react-router";
import { formatAddress } from "../../utils/formatAddress";
import { errorToast, infoToast, successToast } from "../../core/core-index";
import { generateLoadSheetPDF } from "../../utils/generatePDF";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Input from "../../components/form/input/InputField";

interface Order {
  _id: string;
  orderNumber: string;
  orderType: string;
  refNumber: string;
  merchant: string;
  amount: number;
  items: number;
  weight: number;
  status: string;
  orderDetail?: string;
  customer: {
    name: string;
    contactNumber: string;
    deliverCity: string;
    deliveryAddress: string;
  };

  shipperInfo: {
    pickupCity: string;
    pickupAddress: string;
    returnCity: string;
    returnAddress: string;
    mobile: string;
  };
}
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";
const searchOptions = ["ORDER REF #", "TRACKING #"];
export default function LoadSheet() {
  const [searchType, setSearchType] = useState("ORDER REF #");
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [dataSource, setDataSource] = useState<Order[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phoneNo: "",
    employeeCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { isOpen, openModal, closeModal } = useModal();
  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: Order[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
  };
  const handleSearch = async (currentpage = 1, currentpagesize = 10) => {
    let skipSize = currentpage === 1 ? 0 : (currentpage - 1) * currentpagesize;

    const params: any = {
      limit: currentpagesize,
      skip: skipSize,
    };

    if (searchValue) {
      params.search = searchValue;
      params.searchType = searchType.toLowerCase().replace(/\s+#/g, "");
    }
    if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
    if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

    const response = await apiCaller({
      method: "GET",
      url: `/loadSheet/unbookedList`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data);
      settotalCounts(response.totalRecords);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setStartDate(null);
    setEndDate(null);
    setSearchType("ORDER REF #");
    fetchDetails();
  };

  const fetchDetails = async (currentpage = 1, currentpagesize = 10) => {
    let skipSize;
    skipSize = currentpage == 1 ? 0 : (currentpage - 1) * currentpagesize;
    const params: any = {
      limit: currentpagesize,
      skip: skipSize,
    };

    if (searchValue) {
      params.search = searchValue;
      params.searchType = searchType.toLowerCase().replace(/\s+#/g, "");
    }
    if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
    if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

    const response = await apiCaller({
      method: "GET",
      url: `/loadSheet/unbookedList`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data);
      settotalCounts(response.totalRecords);
    }
  };

  const handlePagination = async (page: number, pageSize: number) => {
    setPage(page);
    setPagesize(pageSize);
    fetchDetails(page, pageSize);
  };

  const statusColorMap: Record<string, BadgeColor> = {
    booked: "primary",
    unbooked: "warning",
    inTransit: "info",
    delivered: "success",
    returned: "dark",
    cancelled: "error",
    expired: "error",
    lost: "error",
    stolen: "error",
    damage: "error",
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRowKeys.length === 0) {
      infoToast("Please select at least one order to generate Load Sheet PDF");
      return;
    }

    const pkPhoneRegex = /^(?:\+92|0)3[0-9]{9}$/;
    if (!pkPhoneRegex.test(formData.phoneNo)) {
      errorToast(
        "Please enter a valid phone number (e.g., +923001234567 or 03001234567)."
      );
      return;
    }

    try {
      const orderIds = selectedRowKeys as string[];

      const selectedOrders = selectedRows.filter((order) =>
        orderIds.includes(order._id)
      );

      const firstOrder = selectedOrders[0];
      const response = await apiCaller({
        method: "POST",
        url: "/loadSheet/add",
        data: {
          orders: orderIds,
          rider: {
            name: formData.name,
            phoneNo: formData.phoneNo,
            employeeCode: formData.employeeCode,
          },
        },
      });
      if (response.code === 200) {
        successToast("LoadSheet created successfully!");
        const { data } = response;
        await generateLoadSheetPDF(
          selectedRows,
          {
            shipperName: firstOrder.merchant,
            loadsheetNumber: data.loadsheetNumber,
            personOfContact: firstOrder.merchant,
            pickupAddress: firstOrder.shipperInfo.pickupAddress,
            phoneNo: firstOrder.shipperInfo.mobile,
            origin: "Lahore",
          },
          {
            name: formData.name,
            phoneNo: formData.phoneNo,
            employeeCode: formData.employeeCode,
          }
        );
        setSelectedRowKeys([]);
        setSelectedRows([]);
        setSearchValue("");
        setFormData({
          name: "",
          employeeCode: "",
          phoneNo: "",
        });
        setStartDate(null);
        setEndDate(null);
        setSearchType("ORDER REF #");
        closeModal();
        fetchDetails();
      }
    } catch (error) {}
  };

  const columns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string, record: any) => {
        return <Link to={`/order-view/${record._id}`}>#{text}</Link>;
      },
    },
    {
      title: "Type",
      dataIndex: "orderType",
      key: "orderType",
    },
    {
      title: "Order Reference",
      dataIndex: "refNumber",
      key: "refNumber",
    },
    {
      title: "Customer",
      key: "customer",
      render: (record: Order) => (
        <>
          <div>
            <strong>{record.customer.name}</strong>
          </div>
          <div>{record.customer.contactNumber}</div>
          <div>{record.customer.deliverCity}</div>
          {/* <div>{formatAddress(record.customer.deliveryAddress)}</div> */}
        </>
      ),
    },
    {
      title: "PickUp Address",
      key: "shipperInfo",
      render: (record: Order) => (
        <>
          <div>{formatAddress(record.shipperInfo?.pickupAddress)}</div>
        </>
      ),
    },
    {
      title: "Order Detail",
      dataIndex: "orderDetail",
      key: "orderDetail",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Status",
      key: "status",
      render: (record: Order) => {
        const badgeColor = statusColorMap[record.status] || "light"; // fallback
        return (
          <Badge color={badgeColor} size="sm">
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Order log with filters and search"
      />
      <PageBreadcrumb pageTitle="Load Sheet" />
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Filter Load Sheet
            </h3>
            <div className="flex gap-2">
              {/* <button className="flex bg-gray-400 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </button>
              <button className="flex bg-gray-400 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button> */}
              <Button onClick={openModal}>
                Generate Load Sheet ({selectedRowKeys.length})
              </Button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <div className="w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                >
                  <Label>Advanced Search</Label>
                  <div className="relative">
                    {/* Search Icon */}
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="fill-gray-500 dark:fill-gray-400"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                        />
                      </svg>
                    </span>

                    {/* Search Input */}
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={`Search by ${searchType.toLowerCase()}...`}
                      className="w-full h-11 rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-[160px] text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 sm:pr-[120px]"
                    />

                    {/* Large Screen Buttons */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden gap-1 lg:flex">
                      {searchOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSearchType(option)}
                          className={`px-2 py-1 text-xs rounded-lg border transition whitespace-nowrap ${
                            searchType === option
                              ? "bg-gray-500 text-white border-gray-500"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {/* Small Screen Dropdown */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 lg:hidden">
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-500 focus:outline-none"
                      >
                        {searchOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 mt-5">
                    <div className="col-span-1">
                      <Label>Start Date</Label>
                      <DatePicker
                        value={startDate}
                        onChange={(val) => setStartDate(val)}
                        format="YYYY-MM-DD"
                        className="w-full h-11 rounded-lg border border-gray-200 shadow-theme-xs"
                        placeholder="Select Start Date"
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>End Date</Label>
                      <DatePicker
                        value={endDate}
                        onChange={(val) => setEndDate(val)}
                        format="YYYY-MM-DD"
                        className="w-full h-11 rounded-lg border border-gray-200 shadow-theme-xs"
                        placeholder="Select Start Date"
                      />
                    </div>
                  </div>

                  <div className="my-4 flex justify-end gap-3">
                    <Button
                      className=""
                      variant="outline"
                      onClick={handleClear}
                    >
                      Clear Filter
                    </Button>
                    <Button type="submit" variant="primary">
                      Search Filter
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <Table
                rowKey="_id"
                dataSource={dataSource}
                columns={columns}
                rowSelection={rowSelection}
                scroll={{ x: "max-content" }}
                pagination={{
                  position: ["topRight"],
                  total: totalCounts,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 30, 50, 100],
                  defaultPageSize: 10,
                  defaultCurrent: 1,
                  onChange: (page, pageSize) =>
                    handlePagination(page, pageSize),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[550px] m-4">
        <div className="no-scrollbar relative w-full max-w-[550px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Rider Information
            </h4>
          </div>
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar h-auto overflow-y-auto px-2 pb-3">
              <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <Label>
                    Rider Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Rider Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>
                    Phone No <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="phoneNo"
                    placeholder="Rider phone no"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>
                    Employee Code <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="employeeCode"
                    placeholder="Rider Employee Code"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" type="submit">
                Generate
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
