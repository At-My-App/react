import { useState, useEffect } from "react";
import { useAmaContext } from "../context/AmaProvider";
import { AmaContentDef, AtMyAppClient } from "@atmyapp/core";

/**
 * Hook return type
 */
interface AmaContentHook<T> {
  /** The parsed content data matching the structure definition */
  data: T | null;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

/**
 * Custom hook to fetch JSON content from the CMS using the core library
 *
 * @template T - Content type definition
 * @param path - The content path
 * @param client - Optional AtMyApp client instance from createAtMyApp
 * @returns Object containing the parsed content data, loading state, and errors
 */
export function useAmaContent<T extends AmaContentDef<string, any>>(
  path: T["path"],
  client?: AtMyAppClient
): AmaContentHook<T["structure"]> {
  // Use provided client or get from context
  const context = !client ? useAmaContext() : null;
  const amaClient = client || context?.client;

  if (!amaClient) {
    throw new Error(
      "useAmaContent must be used within an AmaProvider or provide a client instance"
    );
  }

  const [data, setData] = useState<T["structure"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!path) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use the core client's collections API
        const result = await amaClient.collections.get(path, "content");

        if (result.isError) {
          throw new Error(result.errorMessage || "Failed to fetch content");
        }

        setData(result.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [path, amaClient]);

  return {
    data,
    isLoading,
    error,
  };
}
