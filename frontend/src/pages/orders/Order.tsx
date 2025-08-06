import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import { useState } from "react";

const Order = () => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
  };
  const options = [
    { value: "normal", label: "Normal" },
    { value: "reverse", label: "Reverse" },
    { value: "replacement", label: "Replacement" },
  ];
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <div>
        <PageMeta
          title="Mayl Logistics"
          description="Tech-Enabled Shipping and Payment Collection System"
        />
        <PageBreadcrumb pageTitle="Order" />
        <div className="space-y-6">
          <div
            className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
          >
            {/* Card Header */}
            <div className="flex justify-between px-6 py-5">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Order
              </h3>
              <div>
                <button
                  onClick={openModal}
                  className="flex bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                  Create Order
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
              <div className="space-y-6">
                <BasicTableOne />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Order Information
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[500px] overflow-y-auto px-2 pb-3">
              {/* Order Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Order Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Order Type <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={options}
                      defaultValue=""
                      placeholder="Choose Order Type"
                      onChange={handleSelectChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Order Reference Number{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input type="number" placeholder="Order red Number" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Order Amount <span className="text-error-500">*</span>
                    </Label>
                    <Input type="number" value="0" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Order Date <span className="text-error-500">*</span>
                    </Label>
                    <Input type="date" placeholder="Select Order Date" />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Airway Bill Copies{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input type="number" value="1" />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Items <span className="text-error-500">*</span>
                    </Label>
                    <Input type="number" value="1" />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Booking Weight <span className="text-gray-400">(kg)</span>
                    </Label>
                    <Input type="number" value="0" />
                  </div>
                </div>
              </div>
              {/* Customer Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Customer Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Customer Name <span className="text-error-500">*</span>
                    </Label>
                    <Input type="text" placeholder="Enter Customer Name" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Contact Number <span className="text-error-500">*</span>
                    </Label>
                    <Input type="number" placeholder="03xxxxxxxxx" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Delivery City <span className="text-error-500">*</span>
                    </Label>
                    <Input type="text" value="Lahore" disabled />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Delivery Address <span className="text-error-500">*</span>
                    </Label>
                    <Input type="text" placeholder="Customer Address" />
                  </div>
                </div>
              </div>
              {/* Shipper Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Shipper Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Pickup City <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={options}
                      defaultValue=""
                      placeholder="Choose Pickup City"
                      onChange={handleSelectChange}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      Pickup Address <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={options}
                      defaultValue=""
                      placeholder="Choose Pickup Address"
                      onChange={handleSelectChange}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Return City</Label>
                    <Select
                      options={options}
                      defaultValue=""
                      placeholder="Choose Return City"
                      onChange={handleSelectChange}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Return Address</Label>
                    <Select
                      options={options}
                      defaultValue=""
                      placeholder="Choose Return Address"
                      onChange={handleSelectChange}
                    />
                  </div>
                </div>
              </div>
              {/* Additional Information */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Additional Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Order Detail</Label>
                    <Input type="text" />
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Input type="text" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm">Save</Button>
              <Button size="sm" variant="ghost">Save & Print</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Order;
