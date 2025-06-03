import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  createAtMyAppClient,
  AtMyAppClient,
  AtMyAppClientOptions,
} from "@atmyapp/core";

type AmaContextType = {
  client: AtMyAppClient;
  options: AtMyAppClientOptions;
};

const AmaContext = createContext<AmaContextType | null>(null);

export const AmaProvider: React.FC<{
  children: React.ReactNode;
  apiKey: string;
  baseUrl: string;
  previewKey?: string;
}> = ({ children, apiKey, baseUrl, previewKey }) => {
  const value = useMemo(() => {
    const options: AtMyAppClientOptions = {
      apiKey,
      baseUrl,
      previewKey,
    };

    const client = createAtMyAppClient(options);

    return {
      client,
      options,
    };
  }, [apiKey, baseUrl, previewKey]);

  return <AmaContext.Provider value={value}>{children}</AmaContext.Provider>;
};

export const useAmaContext = () => {
  const context = useContext(AmaContext);
  if (!context) {
    throw new Error("useAmaContext must be used within an AmaProvider");
  }
  return context;
};
