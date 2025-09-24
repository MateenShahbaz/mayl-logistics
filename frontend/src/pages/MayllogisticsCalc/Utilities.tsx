import { useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { apiCaller } from "../../core/API/ApiServices";

const Utilities = () => {
  const [trackingNo, setTrackingNo] = useState("");
  const trackingRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<any | null>(null);

  const handleSearch = async () => {
    const response = await apiCaller({
      method: "POST",
      url: "/history/get-track",
      data: { trackingNo },
    });

    if (response.code === 200) {
      setOrders(response.data); // full order with history
    }
  };

  return (
    <>
      <PageMeta title="Mayl Logistics" description="Utilities" />
      <PageBreadcrumb pageTitle="Utilities" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800">
              Order Utilities
            </h3>
          </div>

          <div className="p-4 border-t border-gray-100 sm:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
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

            {/* Show order details */}
            {orders && (
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Order Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* LEFT TABLE */}
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2">Tracking No</td>
                        <td className="border px-3 py-2">
                          {orders?.orderNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Order Type</td>
                        <td className="border px-3 py-2">
                          {orders?.orderType}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Merchant</td>
                        <td className="border px-3 py-2">{orders?.merchant}</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Reference No</td>
                        <td className="border px-3 py-2">
                          {orders?.refNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Airway Bills Copy</td>
                        <td className="border px-3 py-2">
                          {orders?.airwayBillsCopy}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Items</td>
                        <td className="border px-3 py-2">{orders?.items}</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Weight</td>
                        <td className="border px-3 py-2">{orders?.weight}</td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Actual Weight</td>
                        <td className="border px-3 py-2">
                          {orders?.actualWeight}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* RIGHT TABLE */}
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2">Consignee</td>
                        <td className="border px-3 py-2">
                          {orders?.customer?.name} -{" "}
                          {orders?.customer?.contactNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Consignee Address</td>
                        <td className="border px-3 py-2">
                          {orders?.customer?.deliverCity} -{" "}
                          {orders?.customer?.deliveryAddress}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Pickup Address</td>
                        <td className="border px-3 py-2">
                          {orders?.shipperInfo?.pickupCity} -{" "}
                          {orders?.shipperInfo?.pickupAddress}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Return Address</td>
                        <td className="border px-3 py-2">
                          {orders?.shipperInfo?.returnCity} -{" "}
                          {orders?.shipperInfo?.returnAddress}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Amount</td>
                        <td className="border px-3 py-2">
                          {orders?.amount?.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border px-3 py-2">Status</td>
                        <td className="border px-3 py-2">{orders?.status}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Show history */}
                <h4 className="font-semibold mt-6">Order History</h4>
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2">S.No</th>
                      <th className="border px-3 py-2">New Status</th>
                      <th className="border px-3 py-2">Entered By</th>
                      <th className="border px-3 py-2">Date</th>
                      <th className="border px-3 py-2">Home Branch</th>
                      <th className="border px-3 py-2">Dest Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.history.length > 0 ? (
                      orders.history.map((h: any, index: number) => (
                        <tr key={h.id} className="hover:bg-gray-50">
                          <td className="border px-3 py-2">{index + 1}</td>
                          <td className="border px-3 py-2">{h.newStatus}</td>
                          <td className="border px-3 py-2">{h?.createdBy?.shipperNumber}-{h?.createdBy?.firstName}  ({h?.createdBy?.role})</td>
                          <td className="border px-3 py-2">
                            {new Date(h.createdAt).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="border px-3 py-2">LHE</td>
                          <td className="border px-3 py-2">LHE</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No History Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Utilities;
