import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useEffect, useState } from "react";
import { apiCaller } from "../../core/API/ApiServices";
import { successToast } from "../../core/core-index";
import { useAuth } from "../../context/AuthContext";
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  shipperNumber?: string;
  role: string;
  bankName?: string;
  accountNumber?: number;
  accountName?: string;
  status: boolean;
  isVerified: boolean;
}

interface Props {
  user: User | null;
}

export default function UserMetaCard({ user }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<User | null>(null);
  const { setUser } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      setFormData({ ...user });
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNo: formData.phoneNo,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      email: formData.email,
    };
    const response = await apiCaller({
      method: "PUT",
      url: "/userSetting/edit",
      data: data,
    });
    if (response.code === 200) {
      successToast("Updated successfully");
      setUser(response.data);
      closeModal();
    }
  };
  return (
    <>
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
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          {formData && (
            <form onSubmit={handleSave} className="flex flex-col">
              <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                {/* Personal Information */}
                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Personal Information
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        First Name <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        Last Name <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        Email Address <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        name="email"
                        type="text"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        Phone <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        name="phoneNo"
                        type="text"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Bio</Label>
                      <Input type="text" value={formData.role} disabled />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Shipper Number</Label>
                      <Input
                        type="text"
                        value={formData.shipperNumber}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                {/* Bank Information */}
                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Bank Information
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        Bank Name <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        name="bankName"
                        type="text"
                        value={formData.bankName || ""}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        Account Number <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        name="accountNumber"
                        type="text"
                        value={formData.accountNumber || ""}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        Account Name <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        name="accountName"
                        type="text"
                        value={formData.accountName || ""}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
