import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import { useEffect, useState } from "react";
import { apiCaller } from "../../core/API/ApiServices";
import { Table } from "antd";
import { Link } from "react-router";
import { errorToast, successToast } from "../../core/core-index";
import Badge from "../../components/ui/badge/Badge";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { generatePDF } from "../../utils/generatePDF";
import { useAuth } from "../../context/AuthContext";

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

const Order = () => {
  const [dataSource, setDataSource] = useState<Order[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const { user } = useAuth();
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(5);
  const [pickupAddress, setPickupAddress] = useState<any[]>([]);
  const [returnAddress, setReturnAddress] = useState<any[]>([]);
  const [defaultPickup, setDefaultPickup] = useState<any>(null);
  const [defaultReturn, setDefaultReturn] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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
  const options = [
    { value: "normal", label: "Normal" },
    { value: "reversed", label: "Reversed" },
    { value: "replacement", label: "Replacement" },
    { value: "overland", label: "Overland" },
  ];
  const { isOpen, openModal, closeModal } = useModal();

  const fetchDetails = async (currentpage = 1, currentpagesize = 5) => {
    let skipSize;
    skipSize = currentpage == 1 ? 0 : (currentpage - 1) * currentpagesize;

    const response = await apiCaller({
      method: "GET",
      url: `/order/list?limit=${currentpagesize}&skip=${skipSize}`,
    });
    if (response.code === 200) {
      setDataSource(response.data);
      settotalCounts(response.totalRecords);
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
      render: (record: Order) => (
        <Badge color="success" size="sm">
          {record.status}
        </Badge>
      ),
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
                <DropdownItem
                  onItemClick={() => {
                    editHandle(record);
                    closeDropdown();
                  }}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  Edit
                </DropdownItem>
              )}
            </Dropdown>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div>
        <PageMeta
          title="Mayl Logistics"
          description="Tech-Enabled Shipping and Payment Collection System"
        />
        <PageBreadcrumb pageTitle="Order" />
        <div className="space-y-6">
          <div
            className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
          >
            {/* Card Header */}
            <div className="flex justify-between px-6 py-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Order
              </h3>
              <div>
                <Button
                  onClick={openModal}
                  // className="flex bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                  Create Order
                </Button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
              <div className="space-y-6">
                <Table
                  rowKey="_id"
                  dataSource={dataSource}
                  columns={columns}
                  scroll={{ x: "max-content" }}
                  pagination={{
                    total: totalCounts,
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 15, 35, 50],
                    defaultPageSize: 5,
                    defaultCurrent: 1,
                    onChange: (page, pageSize) =>
                      handlePagination(page, pageSize),
                  }}
                />
              </div>
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
                      options={options}
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
    </>
  );
};

export default Order;
