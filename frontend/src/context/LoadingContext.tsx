// src/context/LoadingContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { loadingEmitter } from "../utils/loadingEmitter";
import LoadingSpinner from "../core/Spinner/LoadingSpinner";

interface LoadingContextProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadingEmitter.on("start", () => setLoading(true));
    loadingEmitter.on("stop", () => setLoading(false));
    return () => {
      loadingEmitter.off("start");
      loadingEmitter.off("stop");
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && <LoadingSpinner />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used inside LoadingProvider");
  }
  return context;
};
