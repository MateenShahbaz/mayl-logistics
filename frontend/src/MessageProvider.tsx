import { ReactNode, useEffect } from "react";
import { message } from "antd";
import { setMessageApi } from "./core/core-index";

type Props = {
  children: ReactNode;
};

export const MessageProvider = ({ children }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setMessageApi(messageApi);
  }, [messageApi]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};
