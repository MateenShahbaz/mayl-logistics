import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
