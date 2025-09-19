import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { apiCaller } from "../../core/API/ApiServices";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";

const OrderView = () => {
  const [orderData, setOrderData] = useState<any>({});
  const { id } = useParams();

  const fetchDetails = async () => {
    const response = await apiCaller({
      method: "GET",
      url: `/order/view/${id}`,
    });
    if (response.code === 200) {
      setOrderData(response.data);
    }
  };
  useEffect(() => {
    fetchDetails();
  }, [id]);
  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <PageBreadcrumb pageTitle="Order Detail" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Basic Information
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-3 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Merchant Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.merchant}
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Order Reference
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.refNumber}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Tracking Number
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.orderNumber}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Order Details
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.orderDetail || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Order Type
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.orderType}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    <Badge color="success" size="sm">
                      {orderData?.status}
                    </Badge>
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Invoice Amount
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.amount}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Invoice Date
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.createdAt}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Booking Weight
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.weight}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Actual Weight
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    N/A
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Pickup City
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.shipperInfo?.pickupCity || "Lahore"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Pickup Address
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.shipperInfo?.pickupAddress}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Return City
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.shipperInfo?.returnCity || "Lahore"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Return Address
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.shipperInfo?.returnAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between ">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Customer Information
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Customer Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.customer?.name}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Customer Phone
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.customer?.contactNumber}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    City
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.customer?.deliverCity || "Lahore"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Delivered Address
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {orderData?.customer?.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderView;
