import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Tab from "../../components/ui/button/Tab";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { DatePicker, Table } from "antd";
import Button from "../../components/ui/button/Button";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { Link } from "react-router";
import Badge from "../../components/ui/badge/Badge";
import { apiCaller } from "../../core/API/ApiServices";
import { useModal } from "../../hooks/useModal";
import { errorToast, successToast } from "../../core/core-index";
import { generatePDF } from "../../utils/generatePDF";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";

// const tabs = [
//   { label: "all", count: 8 },
//   { label: "booked", count: 0 },
//   { label: "unbooked", count: 0 },
//   { label: "inTransit", count: 0 },
//   { label: "delivered", count: 0 },
//   { label: "returned", count: 0 },
//   { label: "cancelled", count: 0 },
//   { label: "expired", count: 0 },
//   { label: "lost", count: 0 },
//   { label: "stolen", count: 0 },
//   { label: "damage", count: 0 },
// ];
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

interface Order {
  _id: string;
  orderNumber: string;
  orderType: string;
  refNumber: string;
  amount: number;
  items: number;
  weight: number;
  status: string;
}

type FormData = {
  orderType: string;
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
    pickupAddress: string;
    returnAddress: string;
  };
  orderDetail: string;
  notes: string;
  [key: string]: any; // 👈 allows indexing with string
};
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";
const searchOptions = ["ORDER Ref #", "TRACKING #", "NAME #", "PHONE #"];
export default function OrderLog() {
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
  const { user } = useAuth();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState<any[]>([]);
  const [returnAddress, setReturnAddress] = useState<any[]>([]);
  const [defaultPickup, setDefaultPickup] = useState<any>(null);
  const [defaultReturn, setDefaultReturn] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    orderType: "",
    refNumber: "",
    amount: 0,
    airwayBillsCopy: 0,
    items: 0,
    weight: 0,
    customer: {
      name: "",
      contactNumber: "",
      deliverCity: "Lahore",
      deliveryAddress: "",
    },
    shipperInfo: {
      pickupAddress: defaultPickup,
      returnAddress: defaultReturn,
    },
    orderDetail: "",
    notes: "",
  });

  const { isOpen, openModal, closeModal } = useModal();
  const [isOpenCancel, setIsOpeCancel] = useState(false);
  function toggleDropdown(recordId: string) {
    setOpenDropdownId(openDropdownId === recordId ? null : recordId);
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }

  const closeHandle = () => {
    closeModal();
    setFormData({
      orderType: "",
      refNumber: "",
      amount: 0,
      airwayBillsCopy: 0,
      items: 0,
      weight: 0,
      customer: {
        name: "",
        contactNumber: "",
        deliverCity: "Lahore",
        deliveryAddress: "",
      },
      shipperInfo: {
        pickupAddress: defaultPickup,
        returnAddress: defaultReturn,
      },
      orderDetail: "",
      notes: "",
    });
    setEditingId(null);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleOrderTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, orderType: value }));
  };

  const handlePickupAddressChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      shipperInfo: { ...prev.shipperInfo, pickupAddress: value },
    }));
  };

  const handleReturnAddressChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      shipperInfo: { ...prev.shipperInfo, returnAddress: value },
    }));
  };

  const optionsType = [
    { value: "normal", label: "Normal" },
    { value: "reversed", label: "Reversed" },
    { value: "replacement", label: "Replacement" },
    { value: "overland", label: "Overland" },
  ];

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
      url: `/order/orderlogs`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data.orders);
      settotalCounts(response.totalRecords);
      setTabsCount(response.data.counts);
    }
  };

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
      url: `/order/orderlogs`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data.orders);
      settotalCounts(response.totalRecords);
      setTabsCount(response.data.counts);
    }
  };

  const fetchDropdowns = async () => {
    const response = await apiCaller({
      method: "GET",
      url: "/dropdown/addressList",
    });
    if (response.code === 200) {
      const pickupOptions = response.data.pickupaddress.map((addr: any) => ({
        value: addr.address,
        label: `${addr.address} (${addr.city})`,
      }));

      const returnOptions = response.data.returnaddress.map((addr: any) => ({
        value: addr.address,
        label: `${addr.address} (${addr.city})`,
      }));

      setPickupAddress(pickupOptions);
      setReturnAddress(returnOptions);

      const defaultPickupOption = response.data.pickupaddress.find(
        (opt: any) => opt.default === true
      );

      const defaultReturnOption = response.data.returnaddress.find(
        (opt: any) => opt.default === true
      );
      if (defaultPickupOption) setDefaultPickup(defaultPickupOption.address);
      if (defaultReturnOption) setDefaultReturn(defaultReturnOption.address);
      setFormData({
        orderType: "",
        refNumber: "",
        amount: 0,
        airwayBillsCopy: 0,
        items: 0,
        weight: 0,
        customer: {
          name: "",
          contactNumber: "",
          deliverCity: "Lahore",
          deliveryAddress: "",
        },
        shipperInfo: {
          pickupAddress: defaultPickupOption.address,
          returnAddress: defaultReturnOption.address,
        },
        orderDetail: "",
        notes: "",
      });
    }
  };

  const handlePagination = async (page: number, pageSize: number) => {
    setPage(page);
    setPagesize(pageSize);
    fetchDetails(page, pageSize);
  };

  useEffect(() => {
    fetchDetails();
    fetchDropdowns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pkPhoneRegex = /^(?:\+92|0)3[0-9]{9}$/;
    if (!pkPhoneRegex.test(formData.customer.contactNumber)) {
      errorToast(
        "Please enter a valid phone number (e.g., +923001234567 or 03001234567)."
      );
      return;
    }

    const data = {
      orderType: formData.orderType,
      refNumber: formData.refNumber,
      amount: formData.amount,
      airwayBillsCopy: formData.airwayBillsCopy,
      items: formData.items,
      weight: formData.weight,
      customer: {
        name: formData.customer.name,
        contactNumber: formData.customer.contactNumber,
        deliverCity: "Lahore",
        deliveryAddress: formData.customer.deliveryAddress,
      },
      shipperInfo: {
        pickupAddress: formData.shipperInfo?.pickupAddress || defaultPickup,
        returnAddress: formData.shipperInfo?.returnAddress || defaultReturn,
        pickupCity: "Lahore",
        returnCity: "Lahore",
        mobile: user?.phoneNo,
      },
      orderDetail: formData.orderDetail,
      notes: formData.notes,
    };
    const url = editingId ? `/order/edit/${editingId}` : "/order/add";
    const method = editingId ? "PUT" : "POST";
    const response = await apiCaller({
      method,
      url,
      data: data,
    });
    if (response.code === 200) {
      fetchDetails();
      successToast(
        editingId ? "Order updated successfully" : "Order added successfully"
      );
      if (printMode) {
        generatePDF(response.data);
      }
      closeModal();
      setEditingId(null);
      setFormData({
        orderType: "",
        refNumber: "",
        amount: 0,
        airwayBillsCopy: 0,
        items: 0,
        weight: 0,
        customer: {
          name: "",
          contactNumber: "",
          deliverCity: "Lahore",
          deliveryAddress: "",
        },
        shipperInfo: {
          pickupAddress: defaultPickup,
          returnAddress: defaultReturn,
        },
        orderDetail: "",
        notes: "",
      });
    }
  };

  const editHandle = async (record: Order) => {
    const response = await apiCaller({
      method: "GET",
      url: `/order/view/${record?._id}`,
    });
    if (response.code === 200) {
      const data = response.data;
      setFormData({
        orderType: data.orderType,
        refNumber: data.refNumber,
        amount: data.amount,
        airwayBillsCopy: data.airwayBillsCopy,
        items: data.items,
        weight: data.weight,
        customer: {
          name: data.customer.name,
          contactNumber: data.customer.contactNumber,
          deliverCity: "Lahore",
          deliveryAddress: data.customer.deliveryAddress,
        },
        shipperInfo: {
          pickupAddress: data.shipperInfo?.pickupAddress,
          returnAddress: data.shipperInfo?.returnAddress,
        },
        orderDetail: data.orderDetail,
        notes: data.notes,
      });
      setEditingId(data?._id);
      openModal();
    }
  };

  const handleCancelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelingId) return;

    try {
      const response = await apiCaller({
        method: "PUT",
        url: `/order/cancel/${cancelingId}`,
      });

      if (response.code === 200) {
        successToast("Order canceled successfully ✅");
        setCancelingId(null);
        setIsOpeCancel(false);
        fetchDetails();
      }
    } catch (error) {
      console.error("Error while canceling order:", error);
    }
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
              {record?.status === "unbooked" && (
                <>
                  <DropdownItem
                    onItemClick={() => {
                      editHandle(record);
                      closeDropdown();
                    }}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Edit
                  </DropdownItem>

                  <DropdownItem
                    onItemClick={() => {
                      setIsOpeCancel(true);
                      setCancelingId(record._id);
                      closeDropdown();
                    }}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Cancel order
                  </DropdownItem>
                </>
              )}
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
      <PageBreadcrumb pageTitle="Order Logs" />
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
              <div>
                <Button
                  onClick={openModal}
                  // className="flex bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                  Create Order
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
                // scroll={{ x: "max-content" }}
                pagination={{
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

      <Modal
        isOpen={isOpen}
        onClose={closeHandle}
        className="max-w-[700px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Order Information
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="custom-scrollbar h-[500px] overflow-y-auto px-2 pb-3">
              {/* Order Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Order Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Order Type <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={optionsType}
                      defaultValue={formData.orderType}
                      placeholder="Choose Order Type"
                      onChange={handleOrderTypeChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Order Reference Number{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Order Ref Number"
                      value={formData.refNumber}
                      onChange={(e) =>
                        handleChange("refNumber", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Order Amount <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleChange("amount", e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Airway Bill Copies{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.airwayBillsCopy}
                      onChange={(e) =>
                        handleChange("airwayBillsCopy", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Items <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.items}
                      onChange={(e) => handleChange("items", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Booking Weight <span className="text-gray-400">(kg)</span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Customer Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Customer Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Customer Name <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={formData.customer.name}
                      onChange={(e) =>
                        handleNestedChange("customer", "name", e.target.value)
                      }
                      required
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Contact Number <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={formData.customer.contactNumber}
                      onChange={(e) =>
                        handleNestedChange(
                          "customer",
                          "contactNumber",
                          e.target.value
                        )
                      }
                      required
                      placeholder="03XXXXXXXXX"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Delivery City <span className="text-error-500">*</span>
                    </Label>
                    <Input type="text" value="Lahore" disabled />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Delivery Address <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={formData.customer.deliveryAddress}
                      onChange={(e) =>
                        handleNestedChange(
                          "customer",
                          "deliveryAddress",
                          e.target.value
                        )
                      }
                      required
                      placeholder="Enter customer address"
                    />
                  </div>
                </div>
              </div>
              {/* Shipper Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Shipper Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Pickup City <span className="text-error-500">*</span>
                    </Label>
                    <Input type="text" value="Lahore" disabled />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Pickup Address <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={pickupAddress}
                      defaultValue={formData.shipperInfo.pickupAddress}
                      onChange={handlePickupAddressChange}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Return City</Label>
                    <Input type="text" value="Lahore" disabled />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Return Address</Label>
                    <Select
                      options={returnAddress}
                      defaultValue={formData.shipperInfo.returnAddress}
                      onChange={handleReturnAddressChange}
                    />
                  </div>
                </div>
              </div>
              {/* Additional Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Additional Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Order Detail</Label>
                    <Input
                      type="text"
                      value={formData.orderDetail}
                      onChange={(e) =>
                        handleChange("orderDetail", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeHandle}>
                Close
              </Button>
              <Button
                size="sm"
                type="submit"
                onClick={() => setPrintMode(false)}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="submit"
                onClick={() => setPrintMode(true)}
              >
                Save & Print
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {isOpenCancel && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50">
          {/* Modal Content */}
          <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Confirmation
            </h4>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Are you sure you want to cancel this Order?
            </p>

            <form onSubmit={handleCancelation} className="flex flex-col">
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpeCancel(false)}
                  className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
