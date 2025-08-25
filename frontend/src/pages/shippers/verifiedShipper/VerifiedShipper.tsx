import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import { apiCaller } from "../../../core/API/ApiServices";
import Badge from "../../../components/ui/badge/Badge";

interface Shipper {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  shipperNumber: string;
  isVerified: boolean;
  status: boolean;
  createdAt: string;
}

const VerifiedShipper = () => {
  const [dataSource, setDataSource] = useState<Shipper[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(5);

  const fetchDetails = async (currentpage = 1, currentpagesize = 5) => {
    let skipSize;
    skipSize = currentpage == 1 ? 0 : (currentpage - 1) * currentpagesize;

    const response = await apiCaller({
      method: "GET",
      url: `/shipper/verified?limit=${currentpagesize}&skip=${skipSize}`,
    });

    if (response?.code === 200) {
      setDataSource(response?.data || []);
      settotalCounts(response.totalRecords);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handlePagination = async (page: number, pageSize: number) => {
    setPage(page);
    setPagesize(pageSize);
    fetchDetails(page, pageSize);
  };

  // Define table columns
  const columns: ColumnsType<Shipper> = [
    {
      title: "#",
      dataIndex: "_id",
      key: "index",
      render: (_: any, __: Shipper, index: number) => index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (record: Shipper) => {
        return (
          <div className="flex items-center gap-3">
            <img
              src={`https://avatar.iran.liara.run/username?username=${record.firstName}+${record.lastName}`}
              alt={record.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-800">
                {record.firstName} {record.lastName}
              </span>
              <span className="text-xs text-gray-500">
                {record.shipperNumber}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phoneNo",
      key: "phoneNo",
    },
    {
      title: "Status",
      key: "status",
      render: (record: Shipper) => (
        <Badge color={record.status ? "success" : "error"} size="sm">
          Active
        </Badge>
      ),
    },
    {
      title: "Register At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    // {
    //   title: "Action",
    //   dataIndex: "Action",
    //   render: (record: Shipper) => {
    //     return (
    //       <button
    //         className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
    //       >
    //         Click Verify
    //       </button>
    //     );
    //   },
    // },
  ];

  return (
    <div>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <PageBreadcrumb pageTitle="Verified Shipper" />
      <div className="space-y-6">
        <ComponentCard title="Verified Shipper Table">
          <Table
            rowKey="_id"
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: "max-content" }}
            pagination={{
              total: totalCounts,
              showTotal: (total, range) =>
                `Showing ${range[0]} to ${range[1]} of ${total} entries`,
              showSizeChanger: true,
              pageSizeOptions: [5, 15, 35, 50],
              defaultPageSize: 5,
              defaultCurrent: 1,
              onChange: (page, pageSize) => handlePagination(page, pageSize),
            }}
          />
        </ComponentCard>
      </div>
    </div>
  );
};

export default VerifiedShipper;
