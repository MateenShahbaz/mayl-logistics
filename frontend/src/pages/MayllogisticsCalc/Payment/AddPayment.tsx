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
import { generatePaymentPDF } from "../../../utils/generatePDF";
import { useNavigate } from "react-router";
// import Button from "../../../components/ui/button/Button";

const options = [{ value: "lahore", label: "Lahore" }];

const AddPayment = () => {
  const [status, setStatus] = useState("");
  const [shipperNumber, setShipperNumber] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    shippingCharges: 0,
    extraCharges: 0,
    saleTax: 0,
    incTax: 0,
    gst: 0,
  });
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOrders.length === 0) {
      return errorToast("Please select at least one order");
    }

    const { shippingCharges, extraCharges, saleTax, incTax, gst } = formData;

    const updatedOrders = selectedOrders.map((order) => {
      const weight = Number(order.actualWeight || 0);
      const amount = Number(order.amount || 0);
      const status = order.status?.toLowerCase();

      let totalShipping = shippingCharges;
      if (weight > 1) {
        const extraWeight = weight - 1;
        const extraUnits = Math.ceil(extraWeight);
        totalShipping += extraUnits * extraCharges;
      }

      const gstAmount = (totalShipping * gst) / 100;
      let saleTaxAmount = 0;
      let incTaxAmount = 0;
      let netTotal = 0;

      if (status === "delivered") {
        saleTaxAmount = (amount * saleTax) / 100;
        incTaxAmount = (amount * incTax) / 100;
        netTotal =
          amount - (totalShipping + gstAmount + saleTaxAmount + incTaxAmount);
      } else if (status === "return" || status === "returned") {
        netTotal = -(totalShipping + gstAmount);
      } else {
        netTotal = amount;
      }

      return {
        ...order,
        shippingChargesTotal: totalShipping.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        saleTaxAmount: saleTaxAmount.toFixed(2),
        incTaxAmount: incTaxAmount.toFixed(2),
        netTotal: netTotal.toFixed(2),
      };
    });

    try {
      const payload = {
        shipperNumber: shipperNumber,
        cityCode: "LHR",
        shippingCharges,
        extraCharges,
        saleTax,
        incTax,
        gst,
        orders: updatedOrders.map((o) => o._id),
      };

      const response = await apiCaller({
        method: "POST",
        url: "/payment/add",
        data: payload,
      });
      if (response.code === 200) {
        await generatePaymentPDF(
          updatedOrders,
          response.data.merchant,
          response.data.sheetNumber,
          response.data.createdAt
        );
        navigate("/payment")
      }
    } catch (error) {}
  };

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
                      Generate Payment ({selectedOrders.length})
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
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Shipping charges <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      name="shippingCharges"
                      value={formData.shippingCharges}
                      onChange={handleChange}
                      placeholder="Enter Charges up to one kg"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Extra charges <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      name="extraCharges"
                      value={formData.extraCharges}
                      onChange={handleChange}
                      placeholder="Enter extra shipping charges"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Sale Tax (%) <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      name="saleTax"
                      value={formData.saleTax}
                      onChange={handleChange}
                      placeholder="Enter sales tax"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Inc. Tax (%) <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      name="incTax"
                      value={formData.incTax}
                      onChange={handleChange}
                      placeholder="Enter Inc. tax"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      GST (%) <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      placeholder="Enter GST"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={closeModal}
                  >
                    Close
                  </Button>
                  <Button size="sm" type="submit">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AddPayment;
