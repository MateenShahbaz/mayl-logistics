import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Tab from "../../components/ui/button/Tab";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { DatePicker } from "antd";
import Button from "../../components/ui/button/Button";

const tabs = [
  { label: "All", count: 8 },
  { label: "Booked", count: 0 },
  { label: "Unbooked", count: 0 },
  { label: "In Transit", count: 0 },
];
const options = [
  { value: "all", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "unbooked", label: "Unbooked" },
  { value: "in-transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
  { value: "lost", label: "Lost" },
  { value: "stolen", label: "Stolen" },
  { value: "damage", label: "Damage" },
];
const searchOptions = ["ORDER #", "TRACKING #"];
export default function AirwayBills() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchType, setSearchType] = useState("ORDER #");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
  };
  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Order log with filters and search"
      />
      <PageBreadcrumb pageTitle="Airway Bills" />
      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Filter Orders
            </h3>
            <div className="flex gap-2">
              <button className="flex bg-gray-400 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </button>
              <button className="flex bg-gray-400 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <div className="relative">
                <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar px-1 sm:px-2 md:px-0 max-w-full">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.label}
                      label={tab.label}
                      count={tab.count}
                      active={activeTab === tab.label}
                      onClick={() => setActiveTab(tab.label)}
                    />
                  ))}
                </div>
              </div>

              <div className="w-full">
                <form>
                  <Label>Advanced Search</Label>
                  <div className="relative">
                    {/* Search Icon */}
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="fill-gray-500 dark:fill-gray-400"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                        />
                      </svg>
                    </span>

                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder={`Search by ${searchType.toLowerCase()}...`}
                      className="w-full h-11 rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-[160px] text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 sm:pr-[120px]"
                    />

                    {/* Large Screen Buttons */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden gap-1 lg:flex">
                      {searchOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSearchType(option)}
                          className={`px-2 py-1 text-xs rounded-lg border transition whitespace-nowrap ${
                            searchType === option
                              ? "bg-gray-500 text-white border-gray-500"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {/* Small Screen Dropdown */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 lg:hidden">
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-500 focus:outline-none"
                      >
                        {searchOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3 mt-5">
                    <div className="col-span-1">
                      <Label>Status</Label>
                      <Select
                        options={options}
                        defaultValue=""
                        placeholder="Choose Order Status"
                        onChange={handleSelectChange}
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Start Date</Label>
                      <DatePicker
                        // onChange={handleStartDateChange}
                        format="YYYY-MM-DD"
                        className="w-full h-11 rounded-lg border border-gray-200 shadow-theme-xs"
                        placeholder="Select Start Date"
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>End Date</Label>
                      <DatePicker
                        // onChange={handleStartDateChange}
                        format="YYYY-MM-DD"
                        className="w-full h-11 rounded-lg border border-gray-200 shadow-theme-xs"
                        placeholder="Select Start Date"
                      />
                    </div>
                  </div>

                  <div className="my-4 flex justify-end gap-3">
                    <Button className="" variant="outline">
                      Clear Filter
                    </Button>
                    <Button variant="primary">Search Filter</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
