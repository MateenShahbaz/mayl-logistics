import { useEffect, useState } from "react";
// import { useModal } from "../../hooks/useModal";
import Label from "../form/Label";
import Select from "../form/Select";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Switch from "../form/switch/Switch";
import TextArea from "../form/input/TextArea";
import Input from "../form/input/InputField";
import type { ColumnsType } from "antd/es/table";
import Table from "antd/es/table";
import { apiCaller } from "../../core/API/ApiServices";
import Badge from "../ui/badge/Badge";
import { useModal } from "../../hooks/useModal";
import { successToast } from "../../core/core-index";

interface Address {
  _id?: string;
  type: "" | "pickup" | "return";
  city: string;
  address: string;
  isDefault: boolean;
}

const ShipperAddress = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const [dataSource, setDataSource] = useState<Address[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Address>({
    type: "",
    city: "Lahore",
    address: "",
    isDefault: false,
  });

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, type: value as "pickup" | "return" });
  };

  const handleTextAreaChange = (value: string) => {
    setFormData({ ...formData, address: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, isDefault: checked });
  };

  const fetchDetails = async (currentpage = 1, currentpagesize = 5) => {
    let skipSize;
    skipSize = currentpage == 1 ? 0 : (currentpage - 1) * currentpagesize;

    const response = await apiCaller({
      method: "GET",
      url: `/address/list?limit=${currentpagesize}&skip=${skipSize}`,
    });
    if (response.code === 200) {
      setDataSource(response.data);
      settotalCounts(response.totalRecords);
    }
  };

  const closeHandle = () => {
    closeModal();
    setFormData({
      type: "",
      city: "Lahore",
      address: "",
      isDefault: false,
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

  const options = [
    { value: "pickup", label: "Pick up" },
    { value: "return", label: "Return" },
  ];
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId ? `/address/edit/${editingId}` : "/address/add";
    const method = editingId ? "PUT" : "POST";

    const response = await apiCaller({
      method,
      url,
      data: formData,
    });

    if (response.code === 200) {
      successToast(
        editingId
          ? "Address updated successfully"
          : "Address added successfully"
      );
      fetchDetails();
      closeModal();
      setEditingId(null);
      setFormData({
        type: "",
        city: "Lahore",
        address: "",
        isDefault: false,
      });
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const response = await apiCaller({
      method: "DELETE",
      url: `/address/delete/${id}`,
    });
    if (response.code === 200) {
      successToast("Address deleted successfully");
      fetchDetails();
    }
  };

  const handleEdit = (record: any) => {
    setFormData({
      type: record?.type,
      city: "Lahore",
      address: record?.address,
      isDefault: record?.default,
    });
    setEditingId(record._id || null);
    openModal();
  };

  const columns: ColumnsType<Address> = [
    {
      title: "#",
      dataIndex: "_id",
      key: "index",
      render: (_: any, __: Address, index: number) => index + 1,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <div color={type === "pickup" ? "blue" : "green"}>
          {type.toUpperCase()}
        </div>
      ),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Default",
      dataIndex: "default",
      key: "default",
      render: (isDefault: boolean) => (
        <Badge color={isDefault ? "success" : "error"} size="sm">
          {isDefault ? "Active" : "InActive"}
        </Badge>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            onClick={() => handleEdit(record)}
            className="flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 3.487a2.25 2.25 0 013.182 3.182L7.5 19.313l-4.5 1.5 1.5-4.5L16.862 3.487z"
              />
            </svg>
            {/* Edit */}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleDelete(record._id as string)}
            className="flex items-center gap-1 text-red-600 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {/* Delete */}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
      >
        {/* Card Header */}
        <div className="flex justify-between px-6 py-2 pt-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Address
          </h3>
          <div>
            <button
              onClick={openModal}
              className="flex bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              Add Address
            </button>
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
                onChange: (page, pageSize) => handlePagination(page, pageSize),
              }}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeHandle}
        className="max-w-[550px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[550px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Address Information
            </h4>
          </div>
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar h-auto overflow-y-auto px-2 pb-3">
              <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <Label>
                    Type <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={options}
                    defaultValue={formData.type}
                    placeholder="Choose Address Type"
                    onChange={handleSelectChange}
                  />
                </div>

                <div className="col-span-2">
                  <Label>
                    City <span className="text-error-500">*</span>
                  </Label>
                  <Input name="city" value={formData.city} disabled />
                </div>

                <div className="col-span-2">
                  <Label>
                    Address <span className="text-error-500">*</span>
                  </Label>
                  <TextArea
                    name="address"
                    value={formData.address}
                    onChange={handleTextAreaChange}
                    placeholder="Enter the address"
                    required
                  />
                </div>

                <div className="flex justify-end col-span-2">
                  <Switch
                    label="Default"
                    defaultChecked={formData.isDefault}
                    onChange={handleSwitchChange}
                    color="blue"
                  />
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

export default ShipperAddress;
