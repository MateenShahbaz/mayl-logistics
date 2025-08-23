import React from "react";
import { Spin } from "antd";

const LoadingSpinner: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 9999,
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default LoadingSpinner;
