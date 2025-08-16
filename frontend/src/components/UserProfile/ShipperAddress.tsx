import { useState } from "react";
// import { useModal } from "../../hooks/useModal";
import Label from "../form/Label";
import Select from "../form/Select";
import BasicTableOne from "../tables/BasicTables/BasicTableOne";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Switch from "../form/switch/Switch";
import TextArea from "../form/input/TextArea";
import Input from "../form/input/InputField";

const ShipperAddress = () => {
  //   const { isOpen, openModal, closeModal } = useModal();
  const [activeModal, setActiveModal] = useState<null | "city" | "address">(
    null
  );

  const openCityModal = () => setActiveModal("city");
  const openAddressModal = () => setActiveModal("address");
  const closeModal = () => setActiveModal(null);

  const [selectedOption, setSelectedOption] = useState<string>("");
  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
  };
  const options = [
    { value: "pickup", label: "Pick up" },
    { value: "return", label: "Return" },
  ];

  const cities = [
    { value: "Karachi", label: "Karachi" },
    { value: "Lahore", label: "Lahore" },
    { value: "Islamabad", label: "Islamabad" },
    { value: "Rawalpindi", label: "Rawalpindi" },
    { value: "Faisalabad", label: "Faisalabad" },
    { value: "Multan", label: "Multan" },
    { value: "Peshawar", label: "Peshawar" },
    { value: "Quetta", label: "Quetta" },
    { value: "Sialkot", label: "Sialkot" },
    { value: "Hyderabad", label: "Hyderabad" },
  ];
  return (
    <>
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
      >
        {/* Card Header */}
        <div className="flex justify-between px-6 py-2 pt-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Address
          </h3>
          <div>
            <button
              onClick={openAddressModal}
              className="flex bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              Add Address
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

      {activeModal === "address" && (
        <Modal isOpen onClose={closeModal} className="max-w-[550px] m-4">
          <div className="no-scrollbar relative w-full max-w-[550px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Add Address Information
              </h4>
            </div>
            <form className="flex flex-col">
              <div className="custom-scrollbar h-auto overflow-y-auto px-2 pb-3">
                {/* Order Information */}
                <div className="mt-7">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2">
                      <Label>
                        Type <span className="text-error-500">*</span>
                      </Label>
                      <Select
                        options={options}
                        defaultValue=""
                        placeholder="Choose Address Type"
                        onChange={handleSelectChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>
                        City <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        placeholder="Enter the address"
                        disabled
                        value="Lahore"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>
                        Address <span className="text-error-500">*</span>
                      </Label>
                      <TextArea placeholder="Enter the address" />
                    </div>

                    <div className="flex justify-end col-span-2">
                      <Switch
                        label="Default"
                        defaultChecked={false}
                        //   onChange={handleSwitchChange}
                        color="blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button size="sm">Save</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ShipperAddress;
