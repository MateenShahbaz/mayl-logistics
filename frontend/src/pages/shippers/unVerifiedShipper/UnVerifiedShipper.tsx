// import React from "react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import BasicTableOne from "../../../components/tables/BasicTables/BasicTableOne";

const UnVerifiedShipper = () => {
  return (
    <div>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <PageBreadcrumb pageTitle="Unverified Shipper" />
      <div className="space-y-6">
        <ComponentCard title="Unverified Shipper Table">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
};

export default UnVerifiedShipper;
