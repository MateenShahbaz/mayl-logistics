import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";

const Order = () => {
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
            <div className="custom-scrollbar h-[40px] overflow-y-auto px-2 pb-3">
              {/* <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" value="Musharof" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" value="Chowdhury" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" value="randomuser@pimjo.com" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" value="+09 363 398 46" />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input type="text" value="Team Manager" />
                  </div>
                </div>
              </div> */}
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm">
                Save
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Order;
