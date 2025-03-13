import { useState, useEffect } from "react";
import { useAmaContext } from "../context/AmaProvider";
import { AmaContentRef } from "../types/AmaContent";
import { amaFetch, createAmaUrl } from "../utils/amaFetch";

// Cache store for content data
const contentCache = new Map<string, unknown>();

/**
 * Hook return type
 */
interface AmaContentHook<T extends AmaContentRef<string, unknown>> {
  /** The parsed content data matching the structure definition */
  data: T extends AmaContentRef<infer P, infer D> ? D : never;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

/**
 * Custom hook to fetch JSON content from the CMS
 *
 * @template T - Content reference type
 * @param path - The content path
 * @returns Object containing the parsed content data, loading state, and errors
 */
export function useAmaContent<T extends AmaContentRef<string, unknown>>(
  path: T["path"]
): AmaContentHook<T> {
  const context = useAmaContext();

  if (!context) {
    throw new Error("useAmaContent must be used within an AmaProvider");
  }

  const { apiKey, projectUrl, cache } = context;

  // Using unknown type for data since it will be cast to the correct type in the return
  const [data, setData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!path) {
        setIsLoading(false);
        return;
      }

      // Create cache key
      const cacheKey = `content:${path}`;

      try {
        // Check if the content is in the context cache
        if (cache.has(cacheKey)) {
          setData(cache.get(cacheKey));
          setIsLoading(false);
          return;
        }

        // Check the local contentCache as well
        if (contentCache.has(cacheKey)) {
          setData(contentCache.get(cacheKey));
          setIsLoading(false);
          // Still update the main cache for future references
          cache.set(cacheKey, contentCache.get(cacheKey));
          return;
        }

        // Construct the full URL
        const url = createAmaUrl(projectUrl, path);

        setIsLoading(true);
        setError(null);

        // Fetch the content as JSON
        const contentData = await amaFetch<unknown>(url, {
          apiKey,
          responseType: "json",
        });

        // Store in both caches
        cache.set(cacheKey, contentData);
        contentCache.set(cacheKey, contentData);

        setData(contentData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [path, apiKey, projectUrl, cache]);

  // Cast the data to the correct type based on the content reference
  return {
    data: data as T extends AmaContentRef<infer P, infer D> ? D : never,
    isLoading,
    error,
  };
}
