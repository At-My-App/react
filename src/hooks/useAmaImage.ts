import { useState, useEffect } from "react";
import { useAmaContext } from "../context/AmaProvider";
import { AmaImageRef } from "../types/AmaImage";
import { amaFetch, createAmaUrl } from "../utils/amaFetch";

/**
 * Hook return type
 */
interface AmaImageHook {
  /** The image src as preloaded image (not path) */
  src: string;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

// Cache store for already loaded images
const imageCache = new Map<string, string>();

/**
 * Custom hook to fetch and load an image from the CMS
 *
 * @param path - The image path
 * @returns Object containing the image src, loading state, and errors
 */
export function useAmaImage<C extends AmaImageRef<any, any>>(
  path: C["path"]
): AmaImageHook {
  const context = useAmaContext();

  if (!context) {
    throw new Error("useAmaImage must be used within an AmaProvider");
  }

  const { apiKey, projectUrl, cache } = context;

  const [src, setSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!path) {
        setIsLoading(false);
        return;
      }

      // Create cache key
      const cacheKey = `image:${path}`;

      try {
        // Check if the image URL is in the context cache
        if (cache.has(cacheKey)) {
          setSrc(cache.get(cacheKey) as string);
          setIsLoading(false);
          return;
        }

        // Check the local imageCache as well
        if (imageCache.has(cacheKey)) {
          setSrc(imageCache.get(cacheKey) as string);
          setIsLoading(false);
          // Still update the main cache for future references
          cache.set(cacheKey, imageCache.get(cacheKey));
          return;
        }

        // Construct the full URL
        const url = createAmaUrl(projectUrl, path);

        setIsLoading(true);
        setError(null);

        // For images, we'll create a blob URL from the fetched data
        const arrayBufferData = await amaFetch<Blob>(url, {
          apiKey,
          responseType: "arraybuffer",
        });

        // convert from array buffer to blob
        const blobData = new Blob([arrayBufferData]);

        // Create an object URL from the blob
        const imageUrl = URL.createObjectURL(blobData);

        // Store in both caches
        cache.set(cacheKey, imageUrl);
        imageCache.set(cacheKey, imageUrl);

        setSrc(imageUrl);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching image:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchImage();

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (src && src.startsWith("blob:")) {
        URL.revokeObjectURL(src);
      }
    };
  }, [path, apiKey, projectUrl, cache]);

  return { src, isLoading, error };
}
