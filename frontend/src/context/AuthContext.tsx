import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiCaller } from "../core/API/ApiServices";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  shipperNumber?: string;
  role: string;
  bankName?: string;
  accountNumber?: number;
  accountName?: string;
  status: boolean;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const token = sessionStorage.getItem("token");
  const userfetch = async () => {
    if (token) {
      const response = await apiCaller({
        method: "GET",
        url: "/userSetting/user",
      });
      if (response.code === 200) {
        setUser(response.data);
      }
    }
  };

  useEffect(() => {
    userfetch();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
