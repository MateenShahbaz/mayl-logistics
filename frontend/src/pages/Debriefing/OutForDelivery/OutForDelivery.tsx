import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import { DatePicker, Table } from "antd";
import dayjs from "dayjs";
import Button from "../../../components/ui/button/Button";
import { apiCaller } from "../../../core/API/ApiServices";
import { Link } from "react-router";

const searchOptions = ["SHEET NO #", "COURIER ID #"];
const OutForDelivery = () => {
  const [searchType, setSearchType] = useState("SHEET NO #");
  const [searchValue, setSearchValue] = useState("");
  const [selectDate, setSelectDate] = useState<any>(dayjs());
  const [dataSource, setDataSource] = useState([]);

  const handleSearch = async () => {
    const params: any = {};
    if (searchValue) {
      params.search = searchValue;
      params.searchType = searchType.toLowerCase().replace(/\s+#/g, "");
    }
    if (selectDate) params.selectDate = selectDate.format("YYYY-MM-DD");

    const response = await apiCaller({
      method: "GET",
      url: `/onroute/deliveryList`,
      params,
    });
    if (response.code === 200) {
      setDataSource(response.data);
    }
  };

  const handleClear = () => {
    setSearchType("SHEET NO #");
    setSearchValue("");
    setSelectDate(dayjs());
    setDataSource([]);
  };

  const columns = [
    {
      title: "Sheet No",
      dataIndex: "sheetNumber",
      key: "sheetNumber",
      render: (text: string, record: any) => {
        return <Link to={`/order-view/${record._id}`}>#{text}</Link>;
      },
    },
    { title: "Courier ID", dataIndex: "courierId", key: "courierId" },
    {
      title: "Total Order",
      key: "orderCount",
      render: (_: any, record: any) => record.orders?.length || 0, // 👈 count directly
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let bgColor = "#6b7280";

        switch (status) {
          case "new":
            bgColor = "#f59e0b";
            break;
          case "close":
            bgColor = "#10b981";
            break;
          case "picked":
            bgColor = "#3b82f6";
            break;
          case "cancel":
            bgColor = "#ef4444";
            break;
        }

        return (
          <span
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: bgColor,
              color: "#fff",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: (_: any, record: any) => {
        return (
          <div className="relative inline-block">
            <Button variant="ghost">View</Button>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <PageMeta title="Mayl Logistics" description="Out for delivery" />
      <PageBreadcrumb pageTitle="Out for delivery" />

      <div className="space-y-6">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-between px-6 py-5">
            <h3 className="text-base mt-3 font-medium text-gray-800 dark:text-white/90">
              Filter on route sheets
            </h3>
          </div>

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              <div className="w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                >
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
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
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
                      <Label>Select Date</Label>
                      <DatePicker
                        value={selectDate}
                        onChange={(val) => setSelectDate(val)}
                        format="YYYY-MM-DD"
                        className="w-full h-11 rounded-lg border border-gray-200 shadow-theme-xs"
                        placeholder="Select Select Date"
                      />
                    </div>
                  </div>

                  <div className="my-4 flex justify-end gap-3">
                    <Button
                      className=""
                      variant="outline"
                      onClick={handleClear}
                    >
                      Clear Filter
                    </Button>
                    <Button type="submit" variant="primary">
                      Search Filter
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6 overflow-x-auto overflow-y-visible">
              <Table
                rowKey="_id"
                dataSource={dataSource}
                columns={columns}
                // scroll={{ x: "max-content" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OutForDelivery;
