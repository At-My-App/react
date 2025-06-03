import { useState, useEffect } from "react";
import { useAmaContext } from "../context/AmaProvider";
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
  // Use provided client or get from context
  const context = !client ? useAmaContext() : null;
  const amaClient = client || context?.client;

  if (!amaClient) {
    throw new Error(
      "useAmaFile must be used within an AmaProvider or provide a client instance"
    );
  }

  const [src, setSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!path) {
        setIsLoading(false);
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
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchFile();
  }, [path, amaClient]);

  return { src, isLoading, error };
}
