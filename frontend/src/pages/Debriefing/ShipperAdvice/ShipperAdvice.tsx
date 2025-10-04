import { DatePicker } from "antd";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { useState } from "react";
import dayjs from "dayjs";
import { apiCaller } from "../../../core/API/ApiServices";
import { errorToast, successToast } from "../../../core/core-index";

interface OrderStatuses {
  [orderId: string]: string;
}
const ShipperAdvice = () => {
  const [selectDate, setSelectDate] = useState<any>(dayjs());
  const [route, setRoute] = useState<any>(null);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatuses>({});

  const handleSearch = async () => {
    const params: any = {};
    if (selectDate) params.selectDate = selectDate.format("YYYY-MM-DD");

    const response = await apiCaller({
      method: "GET",
      url: `/onroute/shipper-advice`,
      params,
    });
    if (response.code === 200) {
      setRoute(response.data);
      const statuses: Record<string, string> = {};
      response.data.forEach((o: { _id: string }) => {
        statuses[o._id] = "";
      });
      setOrderStatuses(statuses);
    }
  };

  const handleClear = () => {
    setSelectDate(dayjs());
    setRoute(null);
    setOrderStatuses({});
  };

  const handleStatusChange = (orderId: string, value: string) => {
    const newStatuses = { ...orderStatuses, [orderId]: value };
    setOrderStatuses(newStatuses);
  };

  const handleSaveAll = async () => {
    const updates = Object.entries(orderStatuses)
      .filter(([_, status]) => status && status.trim() !== "")
      .map(([orderId, status]) => ({ orderId, status }));

    if (updates.length === 0) {
      errorToast("No orders selected for update!");
      return;
    }
    try {
      const response = await apiCaller({
        method: "PUT",
        url: `/onroute/shipper-advice/update`,
        data: { orderUpdates: updates },
      });

      if (response.code === 200) {
        successToast("Statuses updated successfully!");
        handleSearch();
      }
    } catch (error) {}
  };

  return (
    <>
      <PageMeta title="Mayl Logistics" description="Shipper Advice" />
      <PageBreadcrumb pageTitle="Shipper Advice" />

      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Changing Status of Shipper Advice
            </h3>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <div className="w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                >
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 mt-5">
                    <div className="col-span-1">
                      <Label>Select Date</Label>
                      <DatePicker
                        value={selectDate}
                        onChange={(val) => setSelectDate(val)}
                        format="YYYY-MM-DD"
                        className="w-full h-11 rounded-lg border border-gray-200 shadow-theme-xs"
                        placeholder="Select Select Date"
                      />
                    </div>
                  </div>

                  <div className="my-4 flex justify-end gap-3">
                    <Button
                      className=""
                      type="button"
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

          <div className="p-4 overflow-x-auto overflow-y-visible">
            {/* Orders Table */}
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Order #</th>
                  <th className="border px-3 py-2 text-left">Merchant</th>
                  <th className="border px-3 py-2 text-left">Customer</th>
                  <th className="border px-3 py-2 text-left">Amount</th>
                  <th className="border px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {route?.length > 0 ? (
                  route?.map((order: any) => (
                    <tr
                      key={order?._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="border px-3 py-2">{order?.orderNumber}</td>
                      <td className="border px-3 py-2">{order?.merchant}</td>
                      <td className="border px-3 py-2">
                        <div className="font-medium">
                          {order?.customer?.name}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {order?.customer?.contactNumber}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {order?.customer?.deliverCity} -{" "}
                          {order?.customer?.deliveryAddress}
                        </div>
                      </td>
                      <td className="border px-3 py-2 font-semibold text-green-600">
                        {order?.amount?.toFixed(2)}
                      </td>
                      <td className="border px-3 py-2">
                        {route?.status !== "close" ? (
                          <select
                            className="border rounded px-2 py-1 text-sm w-full"
                            value={orderStatuses[order?._id] || ""}
                            onChange={(e) =>
                              handleStatusChange(order?._id, e.target.value)
                            }
                          >
                            <option value="">-- Select --</option>
                            <option value="returned">Return</option>
                            <option value="reattempt">Reattempt</option>
                          </select>
                        ) : (
                          <span className="font-semibold text-green-600">
                            {order?.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No Orders Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals & Actions */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handleSaveAll}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Save All
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShipperAdvice;
