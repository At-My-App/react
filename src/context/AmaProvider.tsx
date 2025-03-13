import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

type AmaContextType = {
  apiKey: string;
  projectUrl: string;
  cache: Map<string, any>;
};

const AmaContext = createContext<AmaContextType | null>(null);

export const AmaProvider: React.FC<{
  children: React.ReactNode;
  apiKey: string;
  projectUrl: string;
}> = ({ children, apiKey, projectUrl }) => {
  const [cache] = useState(() => new Map<string, any>());

  const value = useMemo(
    () => ({
      apiKey,
      projectUrl,
      cache,
    }),
    [apiKey, projectUrl, cache]
  );

  return <AmaContext.Provider value={value}>{children}</AmaContext.Provider>;
};

export const useAmaContext = () => {
  const context = useContext(AmaContext);
  if (!context) {
    throw new Error("useAmaContext must be used within an AmaProvider");
  }
  return context;
};
