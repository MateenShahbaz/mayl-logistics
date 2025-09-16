// components/ProtectedRoute.tsx
import { Navigate } from "react-router";
import { isTokenValid } from "./auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = sessionStorage.getItem("token");

  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
