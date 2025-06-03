import { useState, useEffect } from "react";
import { useAmaContext } from "../context/AmaProvider";
import { AmaImageDef, AtMyAppClient } from "@atmyapp/core";

/**
 * Hook return type
 */
interface AmaImageHook {
  /** The image src URL */
  src: string;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

/**
 * Custom hook to fetch and load an image from the CMS using the core library
 *
 * @template T - Image type definition
 * @param path - The image path
 * @param client - Optional AtMyApp client instance from createAtMyApp
 * @returns Object containing the image src, loading state, and errors
 */
export function useAmaImage<T extends AmaImageDef<string, any>>(
  path: T["path"],
  client?: AtMyAppClient
): AmaImageHook {
  // Use provided client or get from context
  const context = !client ? useAmaContext() : null;
  const amaClient = client || context?.client;

  if (!amaClient) {
    throw new Error(
      "useAmaImage must be used within an AmaProvider or provide a client instance"
    );
  }

  const [src, setSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!path) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use the core client's collections API
        const result = await amaClient.collections.get(path, "image");

        if (result.isError) {
          throw new Error(result.errorMessage || "Failed to fetch image");
        }

        setSrc(result.src);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching image:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [path, amaClient]);

  // Separate effect for cleanup to capture the current src value
  useEffect(() => {
    return () => {
      if (src && src.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  return { src, isLoading, error };
}
