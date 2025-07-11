import { useState, useEffect } from "react";
import { useAmaContextSafe } from "../context/AmaProvider";
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
  // Use provided client or get from context with safer error handling
  const context = !client ? useAmaContextSafe() : null;
  const contextError = context?.error || null;
  const amaClient = client || context?.client || null;

  const [data, setData] = useState<T["structure"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      // Handle context errors
      if (contextError) {
        setError(contextError);
        setIsLoading(false);
        return;
      }

      if (!amaClient) {
        setError(new Error("AtMyApp client is not available"));
        setIsLoading(false);
        return;
      }

      if (!path) {
        setIsLoading(false);
        setData(null);
        setError(null);
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
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsLoading(false);
        setData(null);
      }
    };

    fetchContent();
  }, [path, amaClient, contextError]);

  return {
    data,
    isLoading,
    error,
  };
}
