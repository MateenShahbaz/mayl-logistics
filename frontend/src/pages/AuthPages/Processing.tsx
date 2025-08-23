import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import { Spin } from "antd";

const Processing = () => {
  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="w-full max-w-md pt-10 mx-auto"></div>
          <div className="flex flex-col justify-center items-center flex-1 w-full max-w-md mx-auto">
            <Spin size="large" tip="Waiting for Admin Verification..." />

            <div className="mt-6 text-center">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Account Under Review
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Your account has been created successfully. Please wait while
                the admin verifies your details. You will be redirected to your
                dashboard once approved.
              </p>
              <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                <Link to="/signin">Back to login</Link>
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default Processing;
