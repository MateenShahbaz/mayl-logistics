import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { apiCaller } from "../../../core/API/ApiServices";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import { EyeCloseIcon, EyeIcon, MoreDotIcon } from "../../../icons";
import Switch from "../../../components/form/switch/Switch";
import { errorToast, successToast } from "../../../core/core-index";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import { Link } from "react-router";

interface Shipper {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  shipperNumber: string;
  isVerified: boolean;
  status: boolean;
  createdAt: string;
}

const VerifiedShipper = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    password: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    merchant: "",
    pickup: "",
    returnAdd: "",
    status: true, // or false
  });
  const [dataSource, setDataSource] = useState<Shipper[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  function toggleDropdown(recordId: string) {
    setOpenDropdownId(openDropdownId === recordId ? null : recordId);
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, status: checked });
  };
  const fetchDetails = async (currentpage = 1, currentpagesize = 5) => {
    let skipSize;
    skipSize = currentpage == 1 ? 0 : (currentpage - 1) * currentpagesize;

    const response = await apiCaller({
      method: "GET",
      url: `/shipper/verified?limit=${currentpagesize}&skip=${skipSize}`,
    });

    if (response?.code === 200) {
      setDataSource(response?.data || []);
      settotalCounts(response.totalRecords);
    }
  };

  const closeHandle = () => {
    closeModal();
    setFormData({
      firstName: "",
      lastName: "",
      phoneNo: "",
      email: "",
      password: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      pickup: "",
      returnAdd: "",
      merchant: "",
      status: true,
    });
    setEditingId(null);
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handlePagination = async (page: number, pageSize: number) => {
    setPage(page);
    setPagesize(pageSize);
    fetchDetails(page, pageSize);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pkPhoneRegex = /^(?:\+92|0)3[0-9]{9}$/;
    if (!pkPhoneRegex.test(formData.phoneNo)) {
      errorToast(
        "Please enter a valid phone number (e.g., +923001234567 or 03001234567)."
      );
      return;
    }

    const url = editingId ? `/shipper/edit/${editingId}` : "/shipper/add";
    const method = editingId ? "PUT" : "POST";
    try {
      const response = await apiCaller({
        method,
        url,
        data: formData,
      });

      if (response.code === 200) {
        successToast(
          editingId
            ? "Shipper updated successfully"
            : "Shipper added successfully"
        );
        closeModal();
        setEditingId(null);
        fetchDetails();
        setFormData({
          firstName: "",
          lastName: "",
          phoneNo: "",
          email: "",
          password: "",
          bankName: "",
          accountNumber: "",
          pickup: "",
          returnAdd: "",
          merchant: "",
          accountName: "",
          status: true,
        });
      }
    } catch (error) {}
  };

  const editHandle = (record: any) => {
    setFormData({
      firstName: record?.firstName,
      lastName: record?.lastName,
      phoneNo: record?.phoneNo,
      email: record?.email,
      password: "",
      bankName: record?.bankName,
      accountNumber: record?.accountNumber,
      accountName: record?.accountName,
      merchant: record?.merchant,
      status: record?.status,
      pickup: "",
      returnAdd: "",
    });
    setEditingId(record?._id || null);
    openModal();
  };

  // Define table columns
  const columns: ColumnsType<Shipper> = [
    {
      title: "#",
      dataIndex: "_id",
      key: "index",
      render: (_: any, __: Shipper, index: number) => index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (record: Shipper) => {
        return (
          <Link
            to={`/shipper-view/${record._id}`}
            className="flex items-center gap-3"
          >
            <img
              src={`https://avatar.iran.liara.run/username?username=${record.firstName}+${record.lastName}`}
              alt={record.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">
                {record.firstName} {record.lastName}
              </span>
              <span className="text-xs text-gray-500">
                {record.shipperNumber}
              </span>
            </div>
          </Link>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phoneNo",
      key: "phoneNo",
    },
    {
      title: "Status",
      key: "status",
      render: (record: Shipper) => (
        <Badge color={record.status ? "success" : "error"} size="sm">
          {record.status ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      title: "Register At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: (_, record) => {
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
                  to={`/shipper-view/${record._id}`}
                  className="flex items-center gap-3 w-full"
                >
                  View
                </Link>
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  editHandle(record);
                  closeDropdown();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Edit
              </DropdownItem>
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
        <PageBreadcrumb pageTitle="Verified Shipper" />
        <div className="space-y-6">
          <div
            className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
          >
            {/* Card Header */}
            <div className="flex justify-between px-6 py-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Verified Shipper Table
              </h3>
              <div>
                <Button
                  onClick={openModal}
                  // className="flex bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                  Add Shipper
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
              Add Shipper
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="custom-scrollbar h-[500px] overflow-y-auto px-2 pb-3">
              {/* Order Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Shipper Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      First Name
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Last Name
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Merchant Name
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="merchant"
                      value={formData.merchant}
                      onChange={handleChange}
                      placeholder="Enter merchant name"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Mobile Number
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      name="phoneNo"
                      value={formData.phoneNo}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>

                  {!editingId && (
                    <>
                      <div className="col-span-2 lg:col-span-1">
                        <Label>
                          Pickup Address
                          <span className="text-error-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="pickup"
                          value={formData.pickup}
                          onChange={handleChange}
                          placeholder="Enter pickup address"
                          required
                        />
                      </div>

                      <div className="col-span-2 lg:col-span-1">
                        <Label>
                          Return Address
                          <span className="text-error-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="returnAdd"
                          value={formData.returnAdd}
                          onChange={handleChange}
                          placeholder="Enter return Address"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="col-span-2">
                    <Label>
                      Email
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>
                      Password
                      <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required={!editingId}
                        disabled={!!editingId}
                      />
                      {!editingId && (
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showPassword ? (
                            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          ) : (
                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Bank Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Bank Name</Label>
                    <Input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Enter Shipper Bank Name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Account Number</Label>
                    <Input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter Shipper Account Number"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Account Name</Label>
                    <Input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      placeholder="Enter Shipper Account Name"
                    />
                  </div>

                  <div className="flex justify-end col-span-2">
                    <Switch
                      label="Status"
                      defaultChecked={formData.status}
                      onChange={handleSwitchChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeHandle}>
                Close
              </Button>
              <Button size="sm" type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default VerifiedShipper;
