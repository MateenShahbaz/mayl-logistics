import { DatePicker, Table } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { useRef, useState } from "react";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import dayjs from "dayjs";
import { apiCaller } from "../../core/API/ApiServices";

const options = [{ value: "lahore", label: "Lahore" }];
const ShippmentArrives = () => {
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState<any>(dayjs());
  const [courierId, setCourierId] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [weight, setWeight] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);

  const courierRef = useRef<HTMLInputElement>(null);
  const trackingRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  const handleApiCall = async () => {
    const data = {
      courierId,
      trackingNo,
      weight,
    };
    const response = await apiCaller({
      method: "POST",
      url: "/history/shippemt-arrives",
      data,
    });
    if (response.code === 200) {
      const newData = response.data;
      setTableData((prev) => [...prev, { key: newData._id, ...newData }]);
      setTrackingNo("");
      setWeight("");
      trackingRef.current?.focus();
    }
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
  ];
  return (
    <>
      <PageMeta title="Mayl Logistics" description="Shippment Arrives" />
      <PageBreadcrumb pageTitle="Shippment Arrives" />

      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Shippment Arrives & Calculations
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
                      <Label>Select Date</Label>
                      <DatePicker
                        value={startDate}
                        onChange={(val) => setStartDate(val)}
                        format="YYYY-MM-DD"
                        className="w-full h-11 rounded-lg border border-gray-200 shadow-theme-xs"
                        placeholder="Select Date"
                        disabledDate={(current) => {
                          return (
                            current &&
                            current.format("YYYY-MM-DD") !==
                              dayjs().format("YYYY-MM-DD")
                          );
                        }}
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Courier Id</Label>
                      <Input
                        ref={courierRef}
                        defaultValue={courierId}
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
                            weightRef.current?.focus();
                          }
                        }}
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Actual Weight</Label>
                      <Input
                        ref={weightRef}
                        type="number"
                        placeholder="Enter Actual Weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApiCall();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="my-4 flex justify-end gap-3">
                    <Button
                      className=""
                      variant="outline"
                      // onClick={handleClear}
                    >
                      Clear
                    </Button>
                    <Button type="submit" variant="primary">
                      Save
                    </Button>
                  </div>
                </form>

                <Table
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  className="mt-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippmentArrives;
