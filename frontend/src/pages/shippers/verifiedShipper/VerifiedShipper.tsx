// import React from 'react'
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import BasicTableOne from '../../../components/tables/BasicTables/BasicTableOne';

const VerifiedShipper = () => {
  return (
    <div>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <PageBreadcrumb pageTitle="Verified Shipper" />
      <div className="space-y-6">
        <ComponentCard title="Verified Shipper Table">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}

export default VerifiedShipper