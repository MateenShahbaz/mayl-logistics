import { useEffect, useState } from "react";
import { apiCaller } from "../../../core/API/ApiServices";
import { useParams } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

const ViewShipper = () => {
  const [user, setUser] = useState<any>({});
  const { id } = useParams();
  const fetchDetails = async () => {
    const response = await apiCaller({
      method: "GET",
      url: `/shipper/view/${id}`,
    });
    if (response.code === 200) {
      setUser(response.data);
    }
  };
  useEffect(() => {
    fetchDetails();
  }, []);
  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <PageBreadcrumb pageTitle="View Shipper" />
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={`https://avatar.iran.liara.run/username?username=${user?.firstName}+${user?.lastName}`}
                alt="user"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.firstName} {user?.lastName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  First Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.firstName}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Last Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.lastName}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Merchant Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.merchant}
                </p>
              </div>


              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.phoneNo}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Bio
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.role}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Shipper Number
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.shipperNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Bank Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Bank Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.bankName}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Account Number
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.accountNumber}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Account Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.accountName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewShipper;
