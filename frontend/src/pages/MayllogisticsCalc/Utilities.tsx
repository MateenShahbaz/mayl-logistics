import { useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Table } from "antd";
import { apiCaller } from "../../core/API/ApiServices";

const Utilities = () => {
  const [trackingNo, setTrackingNo] = useState("");
  const trackingRef = useRef<HTMLInputElement>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const handleSearch = async () => {
    const data = { trackingNo };

    const response = await apiCaller({
      method: "POST",
      url: "/history/get-track",
      data,
    });

    if (response.code === 200) {
      const order = response.data;

      // Flatten history so each row has order info + history info
      const flattened = order.history.map((h: any) => ({
        ...h,
        orderNumber: order.orderNumber,
        merchant: order.merchant,
        customerName: order.customer.name,
        customerPhone: order.customer.contactNumber,
        deliveryCity: order.customer.deliverCity,
        deliveryAddress: order.customer.deliveryAddress,
        currentStatus: order.currentStatus,
      }));

      setTableData(flattened);
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
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "New Status",
      dataIndex: "newStatus",
      key: "newStatus",
    },
    // {
    //   title: "Courier",
    //   dataIndex: "courierId",
    //   key: "courierId",
    // },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) =>
        new Date(text).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <>
      <PageMeta title="Mayl Logistics" description="Utilities" />
      <PageBreadcrumb pageTitle="Utilities" />

      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Order Utilities
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
                            handleSearch();
                          }
                        }}
                      />
                    </div>
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

export default Utilities;
