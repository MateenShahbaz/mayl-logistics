import axios, { AxiosRequestConfig } from "axios";
import { errorToast } from "../core-index";

const API = axios.create({
  baseURL: "http://localhost:8888",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiCaller = async <T = any>(
  config: AxiosRequestConfig
): Promise<T | null> => {
  try {
    const response = await API.request(config);

    if (response.data.code === 200) {
      return response.data; // success
    }

    return null;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.data?.message;

    if (status === 401) {
      localStorage.removeItem("token");
      errorToast("Unauthorized access. Please login again.");
      window.location.href = "/signin"; // 🔥 no reload, react-router way
      return null;
    }

    if (status === 403) {
      errorToast(message || "Forbidden request");
      return null;
    }

    if (status === 500) {
      errorToast("Server error. Try again later.");
      return null;
    }

    errorToast(error.message || "Something went wrong");
    return null;
  }
};
