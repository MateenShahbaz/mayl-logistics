import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FileInput from "../../components/form/input/FileInput";
import Button from "../../components/ui/button/Button";

const BulkBooking = () => {
  return (
    <>
      <div>
        <PageMeta
          title="Mayl Logistics"
          description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
        />
        <PageBreadcrumb pageTitle="Bulk Booking" />
        <div className="space-y-6">
          <div
            className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
          >
            <div className="flex flex-col lg:flex-row gap-3 lg:w-[50%] py-5 px-3">
              <FileInput />
              <div className="flex gap-3">
                <Button variant="outline">Clear</Button>
                <Button variant="primary">Upload</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkBooking;
