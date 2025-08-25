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
export default function UserAddressCard({ user }: Props) {
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
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
}
