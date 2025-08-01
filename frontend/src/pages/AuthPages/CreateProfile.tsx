import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import CreateProfileForm from "../../components/auth/CreateProfileForm.tsx";

const CreateProfile = () => {
  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <AuthLayout>
        <CreateProfileForm />
      </AuthLayout>
    </>
  );
};

export default CreateProfile;
