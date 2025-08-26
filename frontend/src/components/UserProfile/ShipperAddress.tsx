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

interface Address {
  _id: string;
  type: "pickup" | "return";
  city: string;
  address: string;
  default: boolean;
}

const ShipperAddress = () => {
  //   const { isOpen, openModal, closeModal } = useModal();
  const [activeModal, setActiveModal] = useState<null | "city" | "address">(
    null
  );
  const [dataSource, setDataSource] = useState<Address[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(5);

  const openAddressModal = () => setActiveModal("address");
  const closeModal = () => setActiveModal(null);

  const [selectedOption, setSelectedOption] = useState<string>("");
  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
    console.log(selectedOption);
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
      render: (isDefault: boolean) =>
        <Badge color={isDefault ? "success" : "error"} size="sm">
          {isDefault? "Active" : "InActive"}
        </Badge>
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div>
          {/* <Button type="link" onClick={() => handleEdit(record._id)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button> */}
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
              onClick={openAddressModal}
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

      {activeModal === "address" && (
        <Modal isOpen onClose={closeModal} className="max-w-[550px] m-4">
          <div className="no-scrollbar relative w-full max-w-[550px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Add Address Information
              </h4>
            </div>
            <form className="flex flex-col">
              <div className="custom-scrollbar h-auto overflow-y-auto px-2 pb-3">
                {/* Order Information */}
                <div className="mt-7">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2">
                      <Label>
                        Type <span className="text-error-500">*</span>
                      </Label>
                      <Select
                        options={options}
                        defaultValue=""
                        placeholder="Choose Address Type"
                        onChange={handleSelectChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>
                        City <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        placeholder="Enter the address"
                        disabled
                        value="Lahore"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>
                        Address <span className="text-error-500">*</span>
                      </Label>
                      <TextArea placeholder="Enter the address" />
                    </div>

                    <div className="flex justify-end col-span-2">
                      <Switch
                        label="Default"
                        defaultChecked={false}
                        //   onChange={handleSwitchChange}
                        color="blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button size="sm">Save</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ShipperAddress;
