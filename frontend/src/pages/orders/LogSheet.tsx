import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { apiCaller } from "../../core/API/ApiServices";
import { Table } from "antd";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { generateLoadSheetPDF } from "../../utils/generatePDF";
import { successToast } from "../../core/core-index";

interface RiderInfo {
  name: string;
  phoneNo: string;
  employeeCode: string;
}

export interface LoadSheet {
  id: string;
  loadsheetNumber: string;
  status: string;
  createdAt: string; // ISO string (can format with dayjs/moment)
  rider: RiderInfo;
  totalOrders: number;
  pickedOrders: number;
  unpickedOrders: number;
}

const searchOptions = ["LOAD SHEET #", "RIDER #"];
export default function LogSheet() {
  const { isOpen, openModal, closeModal } = useModal();
  const [searchType, setSearchType] = useState("LOAD SHEET #");
  const [searchValue, setSearchValue] = useState("");
  const [dataSource, setDataSource] = useState<LoadSheet[]>([]);
  const [orders, setOrders] = useState<any>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  function toggleDropdown(recordId: string) {
    setOpenDropdownId(openDropdownId === recordId ? null : recordId);
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }
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

    const response = await apiCaller({
      method: "GET",
      url: `/loadSheet/list`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data);
      settotalCounts(response.totalRecords);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setSearchType("LOAD SHEET #");
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

    const response = await apiCaller({
      method: "GET",
      url: `/loadSheet/list`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data);
      settotalCounts(response.totalRecords);
    }
  };

  const fetchOrders = async (id: string) => {
    const response = await apiCaller({
      method: "GET",
      url: `/loadSheet/getorder/${id}`,
    });
    if (response.code === 200) {
      setOrders(response.data.orders);
      openModal();
    }
  };
  useEffect(() => {
    fetchDetails();
  }, []);
  const handlePagination = async (page: number, pageSize: number) => {
    setPage(page);
    setPagesize(pageSize);
    fetchDetails(page, pageSize);
  };

  const printSheet = async (id: string) => {
    const response = await apiCaller({
      method: "GET",
      url: `/loadSheet/print/${id}`,
    });
    if (response.code === 200) {
      const firstOrder = response.data.orders[0].orderId;
      await generateLoadSheetPDF(
        response.data.orders.map((o: any) => o.orderId),
        {
          shipperName: firstOrder.merchant,
          loadsheetNumber: response.data.loadsheetNumber,
          personOfContact: firstOrder.merchant,
          pickupAddress: firstOrder.shipperInfo.pickupAddress,
          phoneNo: firstOrder.shipperInfo.mobile,
          origin: "Lahore",
        },
        {
          name: response.data.rider.name,
          phoneNo: response.data.rider.phoneNo,
          employeeCode: response.data.rider.employeeCode,
        }
      );
    }
  };

  const cancelSheet = async (id: string) => {
    const response = await apiCaller({
      method: "PUT",
      url: `/loadSheet/updatestatus/${id}`,
    });
    if (response.code === 200) {
      successToast("Status is Changed");
      fetchDetails();
    }
  };

  const columns = [
    {
      title: "LoadSheet No",
      dataIndex: "loadsheetNumber",
      key: "loadsheetNumber",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Rider",
      key: "rider",
      render: (record: LoadSheet) => (
        <>
          <div>
            <strong>{record.rider?.name || "N/A"}</strong>
          </div>
          <div>{record.rider?.phoneNo}</div>
          <div>{record.rider?.employeeCode}</div>
        </>
      ),
    },
    {
      title: "Total Orders",
      key: "totalOrders",
      render: (record: LoadSheet) => (
        <div
          style={{
            cursor: "pointer",
            color: "blue",
          }}
          onClick={() => fetchOrders(record.id)}
        >
          {record.totalOrders}
        </div>
      ),
    },
    {
      title: "Picked",
      dataIndex: "pickedOrders",
      key: "pickedOrders",
    },
    {
      title: "Unpicked",
      dataIndex: "unpickedOrders",
      key: "unpickedOrders",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let bgColor = "#6b7280"; // default gray

        switch (status) {
          case "new":
            bgColor = "#f59e0b"; // yellow
            break;
          case "complete":
            bgColor = "#10b981"; // green
            break;
          case "picked":
            bgColor = "#3b82f6"; // blue
            break;
          case "cancel":
            bgColor = "#ef4444"; // red
            break;
        }

        return (
          <span
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: bgColor,
              color: "#fff",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: (_: any, record: LoadSheet) => {
        return (
          <div className="relative inline-block">
            <button
              className="dropdown-toggle"
              onClick={() => toggleDropdown(record.id)}
            >
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={openDropdownId === record.id}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={() => {
                  printSheet(record.id);
                  closeDropdown();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Print Sheet
              </DropdownItem>
              {record.status === "new" && (
                <DropdownItem
                  onItemClick={() => {
                    cancelSheet(record.id);
                    closeDropdown();
                  }}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  Cancel
                </DropdownItem>
              )}
              {/* {record?.status === "unbooked" && (
                    <DropdownItem
                      onItemClick={() => {
                        editHandle(record);
                        closeDropdown();
                      }}
                      className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                      Edit
                    </DropdownItem>
                  )} */}
            </Dropdown>
          </div>
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
      <PageBreadcrumb pageTitle="Load Sheet Logs " />
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Filter Load Sheet Logs
            </h3>
            <div className="flex gap-2">
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
              </button>
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
                  <div className="my-4 flex justify-end gap-3">
                    <Button
                      className=""
                      variant="outline"
                      onClick={handleClear}
                    >
                      Clear Filter
                    </Button>
                    <Button variant="primary">Search Filter</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6 overflow-x-auto overflow-y-visible">
              <Table
                rowKey="_id"
                dataSource={dataSource}
                columns={columns}
                // scroll={{ x: "max-content" }}
                pagination={{
                  // position: ["topRight"],
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

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
        <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Total Orders
            </h4>
          </div>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  S.No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Tracking No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Order Reference
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Consignee Detail
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Booking Date
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Destination
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Invoice Amount
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order: any, index: number) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.orderId.orderNumber}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.orderId.refNumber}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.orderId.customer?.name} -{" "}
                      {order.orderId.customer?.contactNumber}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {new Date(order.orderId.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.orderId.customer?.deliverCity}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.orderId.amount?.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {/* ✅ show picked/unpicked */}
                      {order.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border border-gray-300 px-3 py-4 text-center"
                    colSpan={8}
                  >
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* </div> */}

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
            {/* <Button size="sm" type="submit">
                Save
              </Button> */}
          </div>
          {/* </form> */}
        </div>
      </Modal>
    </>
  );
}
