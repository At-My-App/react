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
  client: AtMyAppClient | null;
  options: AtMyAppClientOptions;
  error: Error | null;
};

const AmaContext = createContext<AmaContextType | null>(null);

export const AmaProvider: React.FC<{
  children: React.ReactNode;
  apiKey: string;
  baseUrl: string;
  previewKey?: string;
}> = ({ children, apiKey, baseUrl, previewKey }) => {
  const value = useMemo(() => {
    try {
      const options: AtMyAppClientOptions = {
        apiKey,
        baseUrl,
        previewKey,
      };

      const client = createAtMyAppClient(options);

      return {
        client,
        options,
        error: null,
      };
    } catch (error) {
      console.error("Failed to create AtMyApp client:", error);
      const options: AtMyAppClientOptions = {
        apiKey,
        baseUrl,
        previewKey,
      };

      return {
        client: null,
        options,
        error:
          error instanceof Error ? error : new Error("Failed to create client"),
      };
    }
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

// Safe version that returns null instead of throwing
export const useAmaContextSafe = () => {
  const context = useContext(AmaContext);
  return context;
};
