import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

const TotalOrdersCount = () => {
  const series = [75.55];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Total Orders
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Here is your Orders Status Count
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                7 Day Ago
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                15 Day Ago
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                30 Day Ago
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="relative mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`flex flex-col items-center justify-center p-5 rounded-xl shadow-md text-white cursor-pointer transition transform hover:scale-105 hover:shadow-lg `}
            >
              <h4 className="text-sm font-medium text-gray-dark uppercase py-2">Total Order</h4>
              <p className="text-2xl font-bold text-gray-dark">200</p>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-5 rounded-xl shadow-md text-white cursor-pointer transition transform hover:scale-105 hover:shadow-lg `}
            >
              <h4 className="text-sm font-medium text-gray-dark uppercase py-2">Booked</h4>
              <p className="text-2xl font-bold text-gray-dark">23</p>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-5 rounded-xl shadow-md text-white cursor-pointer transition transform hover:scale-105 hover:shadow-lg `}
            >
              <h4 className="text-sm font-medium text-gray-dark uppercase py-2">UnBooked</h4>
              <p className="text-2xl font-bold text-gray-dark">40</p>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-5 rounded-xl shadow-md text-white cursor-pointer transition transform hover:scale-105 hover:shadow-lg `}
            >
              <h4 className="text-sm font-medium text-gray-dark uppercase py-2">WearHouse</h4>
              <p className="text-2xl font-bold text-gray-dark">28</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalOrdersCount;
