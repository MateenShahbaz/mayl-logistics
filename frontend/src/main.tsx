import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { MessageProvider } from "./MessageProvider.tsx";
import "antd/dist/reset.css";
import { LoadingProvider } from "./context/LoadingContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoadingProvider>
      <ThemeProvider>
        <AppWrapper>
          <MessageProvider>
            <App />
          </MessageProvider>
        </AppWrapper>
      </ThemeProvider>
    </LoadingProvider>
  </StrictMode>
);
