import { useRef, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Input from "../../../components/form/input/InputField";
import { errorToast, successToast } from "../../../core/core-index";
import { apiCaller } from "../../../core/API/ApiServices";
import Button from "../../../components/ui/button/Button";
import { Table } from "antd";
import { deliveryRouteSheetPdf } from "../../../utils/generatePDF";
import { useNavigate } from "react-router";

const options = [{ value: "lahore", label: "Lahore" }];
const routeType = [
  { value: "delivery", label: "Delivery" },
  { value: "return", label: "Return" },
];
const AddOnRoute = () => {
  const [status, setStatus] = useState("");
  const [route, setRoute] = useState("");
  const [courierId, setCourierId] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const trackingRef = useRef<HTMLInputElement>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const navigate = useNavigate();
  const handler = async () => {
    if (!courierId || !trackingNo || !route || !status) {
      errorToast("All fields are  required for on route");
      return;
    }

    const response = await apiCaller({
      method: "POST",
      url: "/onroute/fetchOrder",
      data: {
        trackingNo,
      },
    });

    if (response.code === 200) {
      const newData = response.data;
      setTableData((prev) => [...prev, { key: newData._id, ...newData }]);
      setTrackingNo("");
      trackingRef.current?.focus();
    }
  };

  const handleDelete = async (id: string) => {
    setTableData((prev) => prev.filter((item) => item.key !== id));
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
      title: "Customer Name",
      dataIndex: ["customer", "name"],
      key: "customerName",
    },
    {
      title: "Contact",
      dataIndex: ["customer", "contactNumber"],
      key: "contact",
    },
    {
      title: "City",
      dataIndex: ["customer", "deliverCity"],
      key: "city",
    },
    {
      title: "Address",
      dataIndex: ["customer", "deliveryAddress"],
      key: "address",
    },
    {
      title: "Actual Weight",
      dataIndex: "actualWeight",
      key: "actualWeight",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div className="flex gap-1">
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

  const handleGenerateSheet = async () => {
    if (tableData.length === 0) {
      errorToast("No records to generate sheet");
      return;
    }

    if (!courierId || !route || !status) {
      errorToast("All fields are  required for on route");
      return;
    }

    const orderIds = tableData.map((item) => item._id);

    const payload = {
      orders: orderIds,
      courierId,
      type: route,
      status,
    };

    const response = await apiCaller({
      method: "POST",
      url: "/onroute/add",
      data: payload,
    });

    if (response.code === 200) {
      successToast("Delivery Sheet generated successfully");
      await deliveryRouteSheetPdf(
        tableData,
        courierId,
        response.data.sheetNumber,
        response.data.createdAt
      );
      setTableData([]);
      navigate("/on-route")
    }
  };

  return (
    <>
      <PageMeta title="Mayl Logistics" description="Add On Route" />
      <PageBreadcrumb pageTitle="Add On Route" />

      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              On Route Addition
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
                      <Label>On Route Type</Label>
                      <Select
                        options={routeType}
                        defaultValue={route}
                        placeholder="Choose Route Type"
                        onChange={(val: string) => setRoute(val)}
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Courier Id</Label>
                      <Input
                        // ref={courierRef}
                        value={courierId}
                        onChange={(e) => setCourierId(e.target.value)}
                        type="text"
                        placeholder="Enter Courier Id"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            trackingRef.current?.focus();
                          }
                        }}
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Order Number</Label>
                      <Input
                        ref={trackingRef}
                        value={trackingNo}
                        type="text"
                        placeholder="Enter Order Number"
                        onChange={(e) => setTrackingNo(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && trackingNo.length >= 11) {
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
                      Generate Sheet ({tableData.length})
                    </Button>
                  </div>

                  <Table
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
    </>
  );
};

export default AddOnRoute;
