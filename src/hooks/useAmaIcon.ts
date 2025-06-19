import { useState, useEffect } from "react";
import { useAmaContextSafe } from "../context/AmaProvider";
import { AmaIconDef, AtMyAppClient } from "@atmyapp/core";

/**
 * Hook return type
 */
interface AmaIconHook {
  /** The icon src URL */
  src: string;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

/**
 * Custom hook to fetch an icon from the CMS using the core library
 *
 * @template T - Icon type definition
 * @param path - The icon path
 * @param client - Optional AtMyApp client instance from createAtMyApp
 * @returns Object containing the icon src, loading state, and errors
 */
export function useAmaIcon<T extends AmaIconDef<string>>(
  path: T["path"],
  client?: AtMyAppClient
): AmaIconHook {
  // Use provided client or get from context with safer error handling
  const context = !client ? useAmaContextSafe() : null;
  const contextError = context?.error || null;
  const amaClient = client || context?.client || null;

  const [src, setSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchIcon = async () => {
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
        const result = await amaClient.collections.get<AmaIconDef<string>>(
          path,
          "icon"
        );

        if (result.isError) {
          throw new Error(result.errorMessage || "Failed to fetch icon");
        }

        setSrc(result.src);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching icon:", err);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsLoading(false);
        setSrc("");
      }
    };

    fetchIcon();
  }, [path, amaClient, contextError]);

  return { src, isLoading, error };
}
