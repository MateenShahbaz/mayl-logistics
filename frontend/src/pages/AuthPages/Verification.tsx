import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerificationForm from "../../components/auth/VerificationForm.tsx";

const Verification = () => {
  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <AuthLayout>
        <VerificationForm />
      </AuthLayout>
    </>
  );
};

export default Verification;
