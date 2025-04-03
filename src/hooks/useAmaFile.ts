import { useState, useEffect } from "react";
import { useAmaContext } from "../context/AmaProvider";
import { AmaFileRef } from "../types/AmaFile";
import { amaFetch, createAmaUrl } from "../utils/amaFetch";

/**
 * Hook return type
 */
interface AmaFileHook {
  /** The file data as ArrayBuffer */
  data: ArrayBuffer | null;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

type GetPathFromGeneric<T> = T extends AmaFileRef<infer P, any> ? P : never;

// Cache store for file data with path-based keys
const fileCache = new Map<string, ArrayBuffer>();

/**
 * Custom hook to fetch a raw file (as ArrayBuffer) from the CMS
 * @template C - File reference type
 * @param path - The file path
 * @param atmyAppConfig - Optional configuration object from createAtMyApp
 * @returns Object containing fetched data, loading state, and errors
 */
export function useAmaFile<C extends AmaFileRef<any, any>>(
  path: C["path"],
  atmyAppConfig?: ReturnType<typeof import("../createAtMyApp").createAtMyApp>
): AmaFileHook {
  // Use provided config or get from context
  let config: {
    apiKey: string;
    projectUrl: string;
    cache: Map<string, any>;
  };

  if (atmyAppConfig) {
    config = atmyAppConfig;
  } else {
    const context = useAmaContext();
    if (!context) {
      throw new Error(
        "useAmaFile must be used within an AmaProvider or provide a configuration"
      );
    }
    config = context;
  }

  const { apiKey, projectUrl, cache } = config;

  const [data, setData] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!path) {
        setIsLoading(false);
        return;
      }

      // Create cache key
      const cacheKey = `file:${path}`;

      try {
        // Check if the data is in the context cache
        if (cache.has(cacheKey)) {
          setData(cache.get(cacheKey) as ArrayBuffer);
          setIsLoading(false);
          return;
        }

        // Check the local fileCache as well
        if (fileCache.has(cacheKey)) {
          setData(fileCache.get(cacheKey) as ArrayBuffer);
          setIsLoading(false);
          // Still update the main cache for future references
          cache.set(cacheKey, fileCache.get(cacheKey));
          return;
        }

        // Construct the full URL
        const url = createAmaUrl(projectUrl, path);

        setIsLoading(true);
        setError(null);

        // Fetch the file
        const fileData = await amaFetch<ArrayBuffer>(url, {
          apiKey,
          responseType: "arraybuffer",
        });

        // Store in both caches
        cache.set(cacheKey, fileData);
        fileCache.set(cacheKey, fileData);

        setData(fileData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching file:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchFile();
  }, [path, apiKey, projectUrl, cache]);

  return { data, isLoading, error };
}
