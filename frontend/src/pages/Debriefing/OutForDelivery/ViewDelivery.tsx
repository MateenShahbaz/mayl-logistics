import { useParams } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { apiCaller } from "../../../core/API/ApiServices";

interface OrderStatuses {
  [orderId: string]: string;
}

const ViewDelivery = () => {
  const { id } = useParams();
  const [route, setRoute] = useState<any>(null);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatuses>({});
  const [totalDelivered, setTotalDelivered] = useState(0);

  const fetchDetails = async () => {
    const response = await apiCaller({
      method: "GET",
      url: `/onroute/view/${id}`,
    });
    if (response.code === 200) {
      setRoute(response.data);
      const statuses: Record<string, string> = {};
      response.data.orders.forEach((o: { _id: string }) => {
        statuses[o._id] = "";
      });
      setOrderStatuses(statuses);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = (orderId: string, value: string) => {
    const newStatuses = { ...orderStatuses, [orderId]: value };
    setOrderStatuses(newStatuses);

    calcTotal(route?.orders, newStatuses);
  };

  const calcTotal = (orders: any, statuses: any) => {
    const total = orders.reduce((sum: any, o: any) => {
      if (statuses[o._id] === "delivered") {
        return sum + o.amount;
      }
      return sum;
    }, 0);
    setTotalDelivered(total);
  };

  const handleSaveAll = () => {
    const updates = Object.keys(orderStatuses)
      .filter((id) => orderStatuses[id] !== "")
      .map((orderId) => ({
        orderId,
        status: orderStatuses[orderId],
      }));
    console.log(updates);
  };

  return (
    <>
      <PageMeta title="Mayl Logistics" description="Out for delivery" />
      <PageBreadcrumb pageTitle="View delivery" />

      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Changing Status of onRoute Deliveries
            </h3>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">
              Delivery Sheet: {route?.sheetNumber}
            </h2>

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
                {route?.orders.length > 0 ? (
                  route?.orders.map((order: any) => (
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
                        <select
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={orderStatuses[order?._id] || ""}
                          onChange={(e) =>
                            handleStatusChange(order?._id, e.target.value)
                          }
                        >
                          <option value="">-- Select --</option>
                          <option value="delivered">Delivered</option>
                          <option value="return">Return</option>
                          <option value="shipper-advice">Shipper Advice</option>
                          <option value="cna">CNA</option>
                          <option value="cne">CNE</option>
                          <option value="ica">ICA</option>
                        </select>
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
              <p className="font-semibold text-lg">
                Total Delivered Amount:{" "}
                <span className="text-green-600">
                  {totalDelivered?.toFixed(2)}
                </span>
              </p>
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

export default ViewDelivery;
