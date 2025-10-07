import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { errorToast } from "../../../core/core-index";
import { apiCaller } from "../../../core/API/ApiServices";
import { Table } from "antd";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
// import Button from "../../../components/ui/button/Button";

const options = [{ value: "lahore", label: "Lahore" }];

const AddPayment = () => {
  const [status, setStatus] = useState("");
  const [shipperNumber, setShipperNumber] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const { isOpen, openModal, closeModal } = useModal();

  const handler = async () => {
    if (!status || !shipperNumber) {
      return errorToast("Please fill all fields");
    }

    try {
      const repsonse = await apiCaller({
        method: "POST",
        url: "/payment/orders",
        data: {
          shipperNumber,
        },
      });

      if (repsonse.code === 200) {
        setTableData(repsonse.data);
      }
    } catch (error) {}
  };

  const columns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Merchant",
      dataIndex: "merchant",
      key: "merchant",
    },
    {
      title: "Actual Weight",
      dataIndex: "actualWeight",
      key: "actualWeight",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const handleGenerateSheet = () => {
    if (selectedOrders.length === 0) {
      return errorToast("Please select at least one order");
    }
    openModal();
    console.log("Generating sheet for:", selectedOrders);
  };

  const handleSubmit = async () => {};
  return (
    <>
      <PageMeta title="Mayl Logistics" description="Add Payment" />
      <PageBreadcrumb pageTitle="Add Payment" />

      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Add Payment
            </h3>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <div className="w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 mt-5">
                    <div className="col-span-1">
                      <Label>Branch Name</Label>
                      <Select
                        options={options}
                        defaultValue={status}
                        placeholder="Choose Branch Name"
                        onChange={(val: string) => setStatus(val)}
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Shipper Number</Label>
                      <Input
                        value={shipperNumber}
                        onChange={(e) => setShipperNumber(e.target.value)}
                        type="text"
                        placeholder="Enter Shipper Number"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && shipperNumber.length >= 5) {
                            e.preventDefault();
                            handler();
                          }
                        }}
                      />
                    </div>
                  </div>
                </form>

                <div className="mt-6">
                  <div className="flex justify-between items-center">
                    <div className="mb-2 text-sm text-gray-600">
                      Showing {tableData.length}{" "}
                      {tableData.length === 1 ? "entry" : "entries"}
                    </div>
                    <Button onClick={handleGenerateSheet}>
                      Generate Sheet ({selectedOrders.length})
                    </Button>
                  </div>

                  <Table
                    rowSelection={{
                      type: "checkbox",
                      onChange: (_, selectedRows) => {
                        setSelectedOrders(selectedRows);
                      },
                    }}
                    columns={columns}
                    dataSource={tableData}
                    pagination={false}
                    className="mt-2"
                    rowKey="_id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Generate Payment
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}></form>
        </div>
      </Modal>
    </>
  );
};

export default AddPayment;
