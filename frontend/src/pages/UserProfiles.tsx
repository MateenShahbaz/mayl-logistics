import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import ShipperAddress from "../components/UserProfile/ShipperAddress";
import { useAuth } from "../context/AuthContext";

const UserProfiles: React.FC = () => {
  const { user } = useAuth();
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Profile Info",
      children: (
        <div className="space-y-6">
          <UserMetaCard user={user}  />
          <UserInfoCard user={user} />
          <UserAddressCard user={user} />
        </div>
      ),
    },
    {
      key: "2",
      label: "Pickup & Return Address",
      children: (
        <div className="space-y-6">
          <ShipperAddress />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Mayl Logistics"
        description="Tech-Enabled Shipping and Payment Collection System"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </>
  );
};

export default UserProfiles;
