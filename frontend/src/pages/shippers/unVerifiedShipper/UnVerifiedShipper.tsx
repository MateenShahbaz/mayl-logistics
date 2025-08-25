import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import { apiCaller } from "../../../core/API/ApiServices";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import { successToast } from "../../../core/core-index";

// Define the type for your shipper data
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

const UnVerifiedShipper = () => {
  const [dataSource, setDataSource] = useState<Shipper[]>([]);
  const [totalCounts, settotalCounts] = useState(0);
  const [, setPage] = useState(1);
  const [, setPagesize] = useState(5);
  const [selectedId, setSelectedId] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  const fetchDetails = async (currentpage = 1, currentpagesize = 5) => {
    let skipSize;
    skipSize = currentpage == 1 ? 0 : (currentpage - 1) * currentpagesize;

    const response = await apiCaller({
      method: "GET",
      url: `/shipper/notVerified?limit=${currentpagesize}&skip=${skipSize}`,
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

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await apiCaller({
      method: "PUT",
      url: `/shipper/verifyShipper/${selectedId}`,
    });
    closeModal();
    if (response.code === 200) {
      successToast("Shipper Verified Successfully");
      fetchDetails();
    }
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
      title: "Register At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: (_: unknown, record: Shipper) => {
        return (
          <button
            onClick={() => {
              openModal();
              setSelectedId(record._id);
            }}
            className="px-3 py-[10px] text-sm font-medium text-white bg-black rounded hover:bg-white hover:text-black transition-colors"
          >
            Click Verify
          </button>
        );
      },
    },
  ];

  return (
    <>
      <div>
        <PageMeta
          title="Mayl Logistics"
          description="Tech-Enabled Shipping and Payment Collection System"
        />
        <PageBreadcrumb pageTitle="Unverified Shipper" />
        <div className="space-y-6">
          <ComponentCard title="Unverified Shipper Table">
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Confirmation
            </h4>
          </div>
          <form onClick={handleVerification} className="flex flex-col">
            {/* Body text */}
            <p className="px-2 mt-4 text-gray-600 dark:text-gray-300">
              Are you sure you want to verify this shipper?
            </p>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button type="submit" size="sm">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default UnVerifiedShipper;
