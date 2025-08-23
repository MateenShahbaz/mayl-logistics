import { MessageInstance } from "antd/es/message/interface";

let messageApi: MessageInstance | null = null;

export const setMessageApi = (api: MessageInstance) => {
  messageApi = api;
};

const showToast = (type: "success" | "error" | "info" | "warning" | "loading", content: string) => {
  if (!messageApi) {
    console.warn("messageApi not set!");
    return;
  }
  messageApi.open({ type, content });
};

export const successToast = (message: string) => showToast("success", message);
export const errorToast = (message: string) => showToast("error", message);
export const infoToast = (message: string) => showToast("info", message);
export const warningToast = (message: string) => showToast("warning", message);

export const fielderrorToast = errorToast;
export const customerrorToast = errorToast;

export const loadingToast = () => {
  if (!messageApi) {
    console.warn("messageApi not set!");
    return () => {};
  }
  const key = "loading_key";
  messageApi.open({
    type: "loading",
    content: "Loading...",
    key,
    duration: 0,
  });
  return () => messageApi?.destroy(key);
};
