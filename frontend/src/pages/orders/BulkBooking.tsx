import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FileInput from "../../components/form/input/FileInput";
import Button from "../../components/ui/button/Button";
import { errorToast, infoToast, successToast } from "../../core/core-index";
import { apiCaller } from "../../core/API/ApiServices";
import { generatePDFForOrders } from "../../utils/generatePDF";

// Define row type
interface OrderRow {
  key: number;
  "Order Reference Number"?: string;
  "Order Amount"?: string | number;
  "Order Detail"?: string;
  "Customer Name"?: string;
  "Customer Phone"?: string;
  "Order Address"?: string;
  City?: string;
  Items?: string;
  "Airway Bill Copies"?: string;
  Notes?: string;
  "Order Type"?: string;
  "Booking Weight"?: string | number;
  status?: string;
}

const BulkBooking: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const [validOrders, setValidOrders] = useState<OrderRow[]>([]);
  // const [invalidOrders, setInvalidOrders] = useState<OrderRow[]>([]);
  const pkPhoneRegex = /^(?:\+92|0)3[0-9]{9}$/;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = () => {
    const fileToUse = file ?? fileInputRef.current?.files?.[0] ?? null;

    if (!fileToUse) {
      errorToast("Please select a file first.");
      return;
    }

    if (!fileToUse.name.endsWith(".xlsx") && !fileToUse.name.endsWith(".xls")) {
      errorToast("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      errorToast("Failed to read file. See console for details.");
    };

    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error("No data in file result");
        }

        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        if (!jsonData || jsonData.length === 0) {
          errorToast("No rows found in the uploaded file.");
          return;
        }

        const validatedData: OrderRow[] = jsonData.map((row, index) => {
          const errors: string[] = [];

          if (!row["Order Reference Number"])
            errors.push("Order Reference Number is required");
          if (!row["Order Amount"]) errors.push("Order Amount is required");
          if (!row["Customer Name"]) errors.push("Customer Name is required");
          if (!row["Customer Phone"]) errors.push("Customer Phone is required");
          if (!row["Order Address"]) errors.push("Order Address is required");
          if (!row["City"]) errors.push("City is required");
          if (!row["Items"]) errors.push("Items are required");
          if (!row["Airway Bill Copies"])
            errors.push("Airway Bill Copies are required");

          if (row["City"] && String(row["City"]).toLowerCase() !== "lahore") {
            errors.push("City must be Lahore only");
          }

          if (
            row["Customer Phone"] &&
            !pkPhoneRegex.test(String(row["Customer Phone"]))
          ) {
            errors.push("Invalid phone number format");
          }

          let orderTypeValue =
            row["Order Type"] ??
            row["Order Type (Normal/Reversed/Replacement/Overland)"];

          if (!orderTypeValue) {
            errors.push("Order Type is required");
          } else {
            const allowedTypes = [
              "Normal",
              "Reversed",
              "Replacement",
              "Overland",
            ];
            const normalizedValue = String(orderTypeValue).trim().toLowerCase();

            const matchedType = allowedTypes.find(
              (t) => t.toLowerCase() === normalizedValue
            );

            if (!matchedType) {
              errors.push(
                "Order Type must be one of: Normal, Reversed, Replacement, Overland"
              );
            } else {
              orderTypeValue = matchedType;
            }
          }

          return {
            key: index,
            ...row,
            "Order Type": orderTypeValue,
            status: errors.length > 0 ? `❌ ${errors.join(", ")}` : "✅ Valid",
          } as OrderRow;
        });

        setOrders(validatedData);
        successToast(`File processed — ${validatedData.length} rows loaded`);
        // console.log("validatedData:", validatedData);
      } catch (err) {
        console.error("Failed to parse Excel:", err);
        errorToast("Failed to parse Excel file. See console for details.");
      }
    };

    reader.readAsArrayBuffer(fileToUse);
  };

  const handleClear = () => {
    setOrders([]);
    setSelectedRowKeys([]);
    setFile(null);

    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (err) {
        console.warn("Could not clear input.value directly", err);
      }
    }

    infoToast("Cleared all data.");
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/sample.xlsx";
    link.download = "sample.xlsx";
    link.click();
  };

  const handleGenerateOrders = async () => {
    if (selectedRowKeys.length === 0) {
      infoToast("Please select at least one order.");
      return;
    }

    const selectedOrders = orders.filter((o) =>
      selectedRowKeys.includes(o.key)
    );

    // const valid = selectedOrders.filter((o) => o.status?.startsWith("✅"));
    const invalid = selectedOrders.filter((o) => o.status?.startsWith("❌"));
    // if (valid.length > 0) {
    //   successToast(`${valid.length} valid order(s) ready to generate.`);
    // }
    if (invalid.length > 0) {
      errorToast(`${invalid.length} invalid order(s) found.`);
      return;
    }

    const response = await apiCaller({
      method: "POST",
      url: "/order/excel",
      data: selectedOrders,
    });
    if (response.code === 200) {
      successToast("Orders Added");
      setOrders([]);
      setSelectedRowKeys([]);
      setFile(null);

      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch (err) {
          console.warn("Could not clear input.value directly", err);
        }
      }
    }
  };

  const handleGenerateOrdersAndPrint = async () => {
    if (selectedRowKeys.length === 0) {
      infoToast("Please select at least one order.");
      return;
    }

    const selectedOrders = orders.filter((o) =>
      selectedRowKeys.includes(o.key)
    );
    const invalid = selectedOrders.filter((o) => o.status?.startsWith("❌"));

    if (invalid.length > 0) {
      errorToast(`${invalid.length} invalid order(s) found.`);
      return;
    }

    const response = await apiCaller({
      method: "POST",
      url: "/order/excel",
      data: selectedOrders,
    });

    if (response.code === 200) {
      successToast("Orders Added");
      await generatePDFForOrders(response.data);
      setOrders([]);
      setSelectedRowKeys([]);
      setFile(null);

      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch (err) {
          console.warn("Could not clear input.value directly", err);
        }
      }
    }
  };

  const handleClearSelected = () => {
    setOrders((prev) =>
      prev.filter((order) => !selectedRowKeys.includes(order.key))
    );
    setSelectedRowKeys([]);
    infoToast("Selected rows removed.");
  };

  const columns: ColumnsType<OrderRow> = [
    { title: "Order Ref", dataIndex: "Order Reference Number" },
    { title: "Amount", dataIndex: "Order Amount" },
    { title: "Customer Name", dataIndex: "Customer Name" },
    { title: "Phone", dataIndex: "Customer Phone" },
    { title: "Address", dataIndex: "Order Address" },
    { title: "City", dataIndex: "City" },
    { title: "Items", dataIndex: "Items" },
    { title: "Airway Bills", dataIndex: "Airway Bill Copies" },
    { title: "Order Type", dataIndex: "Order Type" },
    { title: "Booking Weight", dataIndex: "Booking Weight" },
    { title: "Status", dataIndex: "status" },
  ];

  return (
    <div>
      <PageMeta title="Mayl Logistics" description="Bulk Booking Page" />
      <PageBreadcrumb pageTitle="Bulk Booking" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col lg:flex-row gap-3 lg:w-[70%] py-5 px-3">
            {/* Use FileInput component with ref */}
            <FileInput
              ref={fileInputRef}
              className="w-full"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
            />

            <div className="flex gap-3 w-[100%]">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                Sample File
              </Button>
              <Button variant="primary" onClick={handleUpload}>
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-3">
        <div
          className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
        >
          {/* Card Header */}
          <div className="flex justify-end px-6 py-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClearSelected}>
                Clear Selected Orders
              </Button>
              <Button variant="primary" onClick={handleGenerateOrders}>
                Generate Orders
              </Button>

              <Button variant="primary" onClick={handleGenerateOrdersAndPrint}>
                Generate Orders and Print
              </Button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
            <div className="space-y-6">
              {orders.length > 0 && (
                <div className="mt-6">
                  <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={orders}
                    pagination={false}
                    scroll={{ x: true }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkBooking;
