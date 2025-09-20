import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Tab from "../../components/ui/button/Tab";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { DatePicker, Table } from "antd";
import Button from "../../components/ui/button/Button";
import { Link } from "react-router";
import Badge from "../../components/ui/badge/Badge";
import { apiCaller } from "../../core/API/ApiServices";
import { errorToast } from "../../core/core-index";
import { generatePDFForOrders } from "../../utils/generatePDF";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { MoreDotIcon } from "../../icons";
import * as XLSX from "xlsx";
const options = [
  { value: "all", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "unbooked", label: "Unbooked" },
  { value: "intransit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
  { value: "lost", label: "Lost" },
  { value: "stolen", label: "Stolen" },
  { value: "damage", label: "Damage" },
];

export interface Order {
  _id: string;
  orderNumber: string;
  orderType: "normal" | "reversed" | "replacement" | "overland";
  merchant?: string;
  refNumber: string;
  amount: number;
  airwayBillsCopy: number;
  items: number;
  weight: number;
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
  orderDetail?: string;
  notes?: string;
  status:
    | "booked"
    | "unbooked"
    | "inTransit"
    | "delivered"
    | "returned"
    | "cancelled"
    | "expired"
    | "lost"
    | "stolen"
    | "damage";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";
const searchOptions = ["ORDER Ref #", "TRACKING #"];
export default function AirwayBills() {
  const [dataSource, setDataSource] = useState<Order[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [tabsCount, setTabsCount] = useState<any>({});
  const [searchType, setSearchType] = useState("ORDER Ref #");
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<Order[]>([]);
  const handleSearch = async (currentpage = 1, currentpagesize = 10) => {
    let skipSize = currentpage === 1 ? 0 : (currentpage - 1) * currentpagesize;

    const params: any = {
      limit: currentpagesize,
      skip: skipSize,
    };

    if (activeTab && activeTab !== "all") params.status = activeTab;
    if (status && status !== "all") params.status = status;
    if (searchValue) {
      params.search = searchValue;
      params.searchType = searchType.toLowerCase().replace(/\s+#/g, "");
    }
    if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
    if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

    const response = await apiCaller({
      method: "GET",
      url: `/order/airwayBills`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data.orders);
      settotalCounts(response.totalRecords);
      setTabsCount(response.data.counts);
    }
  };
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  function toggleDropdown(recordId: string) {
    setOpenDropdownId(openDropdownId === recordId ? null : recordId);
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }
  const handleClear = () => {
    setSearchValue("");
    setStatus("");
    setStartDate(null);
    setEndDate(null);
    setSearchType("ORDER Ref #");
    setActiveTab("all");
    fetchDetails();
  };
  useEffect(() => {
    handleSearch(1, 10);
  }, [activeTab]);

  const fetchDetails = async (currentpage = 1, currentpagesize = 10) => {
    let skipSize;
    skipSize = currentpage == 1 ? 0 : (currentpage - 1) * currentpagesize;
    const params: any = {
      limit: currentpagesize,
      skip: skipSize,
    };

    if (activeTab && activeTab !== "all") params.status = activeTab;
    if (status && status !== "all") params.status = status;
    if (searchValue) {
      params.search = searchValue;
      params.searchType = searchType.toLowerCase().replace(/\s+#/g, "");
    }
    if (startDate) params.startDate = startDate.format("YYYY-MM-DD");
    if (endDate) params.endDate = endDate.format("YYYY-MM-DD");

    const response = await apiCaller({
      method: "GET",
      url: `/order/airwayBills`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data.orders);
      settotalCounts(response.totalRecords);
      setTabsCount(response.data.counts);
    }
  };

  const handlePagination = async (page: number, pageSize: number) => {
    setPage(page);
    setPagesize(pageSize);
    fetchDetails(page, pageSize);
  };

  useEffect(() => {
    fetchDetails();
  }, []);

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
  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: Order[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
  };

  const generateAirwayBills = async () => {
    if (selectedRows.length === 0) {
      errorToast("No orders seleted");
    }
    await generatePDFForOrders(selectedRows);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setSearchValue("");
    setStartDate(null);
    setEndDate(null);
    setSearchType("ORDER Ref #");
  };

  const generateExcelSheet = async () => {
    if (selectedRows.length === 0) {
      errorToast("No orders selected");
      return;
    }

    // Convert selectedRows to worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      selectedRows.map((order) => ({
        "Order Number": order.orderNumber,
        "Order Type": order.orderType,
        Merchant: order.merchant,
        "Reference No": order.refNumber,
        Amount: order.amount,
        "Airway Bills Copy": order.airwayBillsCopy,
        Items: order.items,
        Weight: order.weight,
        "Customer Name": order.customer?.name,
        "Customer Contact": order.customer?.contactNumber,
        "Delivery City": order.customer?.deliverCity,
        "Delivery Address": order.customer?.deliveryAddress,
        "Pickup City": order.shipperInfo?.pickupCity,
        "Pickup Address": order.shipperInfo?.pickupAddress,
        "Return City": order.shipperInfo?.returnCity,
        "Return Address": order.shipperInfo?.returnAddress,
        "Shipper Mobile": order.shipperInfo?.mobile,
        "Order Detail": order.orderDetail,
        Notes: order.notes,
        Status: order.status,
        "Created At": new Date(order.createdAt).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, "orders.xlsx");

    setSelectedRowKeys([]);
    setSelectedRows([]);
    setSearchValue("");
    setStartDate(null);
    setEndDate(null);
    setSearchType("ORDER Ref #");
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
      title: "Reference",
      dataIndex: "refNumber",
      key: "refNumber",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
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
    {
      title: "Action",
      dataIndex: "Action",
      render: (_: any, record: Order) => {
        return (
          <div className="relative inline-block">
            <button
              className="dropdown-toggle"
              onClick={() => toggleDropdown(record._id)}
            >
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={openDropdownId === record._id}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                <Link
                  to={`/order-view/${record._id}`}
                  className="flex items-center gap-3 w-full"
                >
                  View
                </Link>
              </DropdownItem>
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
      <PageBreadcrumb pageTitle="Airway Bills" />
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Filter Orders
            </h3>
            <div className="flex gap-2">
              <div>
                <Button onClick={generateAirwayBills}>
                  Generate Print ({selectedRowKeys.length})
                </Button>
              </div>

              <div>
                <Button onClick={generateExcelSheet}>
                  Export Excel ({selectedRowKeys.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <div className="relative">
                <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar px-1 sm:px-2 md:px-0 max-w-full">
                  {Object.keys(tabsCount).map((tab) => (
                    <Tab
                      key={tab}
                      label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                      count={tabsCount[tab]}
                      active={activeTab === tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setStatus("");
                      }}
                    />
                  ))}
                </div>
              </div>

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
                      <Label>Status</Label>
                      <Select
                        options={options}
                        defaultValue={status}
                        placeholder="Choose Order Status"
                        onChange={(val: string) => setStatus(val)}
                      />
                    </div>

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

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6 overflow-x-auto overflow-y-visible">
              <Table
                rowKey="_id"
                dataSource={dataSource}
                columns={columns}
                rowSelection={rowSelection}
                // scroll={{ x: "max-content" }}
                pagination={{
                  // position: ["topRight"],
                  total: totalCounts,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 50, 100, totalCounts],
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
    </>
  );
}
