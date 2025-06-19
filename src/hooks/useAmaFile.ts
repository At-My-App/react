import { useState, useEffect } from "react";
import { useAmaContextSafe } from "../context/AmaProvider";
import { AmaFileDef, AtMyAppClient } from "@atmyapp/core";

/**
 * Hook return type
 */
interface AmaFileHook {
  /** The file URL */
  src: string;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

/**
 * Custom hook to fetch a file from the CMS using the core library
 *
 * @template T - File type definition
 * @param path - The file path
 * @param client - Optional AtMyApp client instance from createAtMyApp
 * @returns Object containing file src, loading state, and errors
 */
export function useAmaFile<T extends AmaFileDef<string, any>>(
  path: T["path"],
  client?: AtMyAppClient
): AmaFileHook {
  // Use provided client or get from context with safer error handling
  const context = !client ? useAmaContextSafe() : null;
  const contextError = context?.error || null;
  const amaClient = client || context?.client || null;

  const [src, setSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
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
        setSrc("");
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use the core client's collections API
        const result = await amaClient.collections.get(path, "file");

        if (result.isError) {
          throw new Error(result.errorMessage || "Failed to fetch file");
        }

        setSrc(result.src);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching file:", err);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsLoading(false);
        setSrc("");
      }
    };

    fetchFile();
  }, [path, amaClient, contextError]);

  return { src, isLoading, error };
}
