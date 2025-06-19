import { useState, useEffect, useCallback } from "react";
import { useAmaContextSafe } from "../context/AmaProvider";
import { AmaImageDef, AtMyAppClient } from "@atmyapp/core";

/**
 * Hook return type
 */
interface AmaImageHook {
  /** The image src URL (data URL or blob URL) */
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
  // Use provided client or get from context with safer error handling
  const context = !client ? useAmaContextSafe() : null;
  const contextError = context?.error || null;
  const amaClient = client || context?.client || null;

  const [src, setSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to create image URL from different data types
  const createImageUrl = useCallback((fileContent: any): string | null => {
    try {
      if (!fileContent) {
        return null;
      }

      // Check if it's already a data URL or blob URL
      if (
        typeof fileContent === "string" &&
        (fileContent.startsWith("data:image/") ||
          fileContent.startsWith("blob:"))
      ) {
        return fileContent;
      }

      // Check if it's a regular URL
      if (typeof fileContent === "string" && fileContent.startsWith("http")) {
        return fileContent;
      }

      // Handle ArrayBuffer or Blob data
      let blob: Blob;
      if (fileContent instanceof ArrayBuffer) {
        blob = new Blob([fileContent]);
      } else if (fileContent instanceof Blob) {
        blob = fileContent;
      } else if (fileContent instanceof Uint8Array) {
        blob = new Blob([fileContent]);
      } else {
        // Try to convert other data types
        blob = new Blob([fileContent]);
      }

      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error("Failed to create image URL:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchImage = async () => {
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

        // Clean up previous blob URL if exists
        if (src && src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
          setSrc("");
        }

        // Use the core client's collections API
        const result = await amaClient.collections.get<
          AmaImageDef<string, any>
        >(path, "image");

        if (result.isError) {
          throw new Error(result.errorMessage || "Failed to fetch image");
        }

        // Handle different response formats
        let imageUrl: string | null = null;

        if (result.src) {
          // If we get a src field, use it directly or process it
          imageUrl = createImageUrl(result.src);
        } else {
          throw new Error(
            "Unable to create image URL from response, no src field found"
          );
        }

        if (imageUrl) {
          setSrc(imageUrl);
        } else {
          throw new Error("Unable to create image URL from response");
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching image:", err);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsLoading(false);
        setSrc("");
      }
    };

    fetchImage();
  }, [path, amaClient, contextError, createImageUrl]);

  // Cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      if (src && src.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(src);
        } catch (error) {
          console.warn("Failed to revoke blob URL:", error);
        }
      }
    };
  }, [src]);

  return { src, isLoading, error };
}
