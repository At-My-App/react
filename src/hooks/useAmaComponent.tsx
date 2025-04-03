import { useState, useEffect } from "react";
import { useAmaContext } from "../context/AmaProvider";
import { AmaComponentRef, AmaComponentConfig } from "../types/AmaComponent";
import { amaFetch, createAmaUrl } from "../utils/amaFetch";
import { sanitizeHtml } from "../utils/sanitizeHtml";

// Cache store for component HTML
const componentCache = new Map<
  string,
  {
    html: string;
    timestamp: number;
  }
>();

/**
 * Hook return type
 */
interface AmaComponentHook {
  /** The HTML content as a string */
  html: string;
  /** True while data is being fetched */
  isLoading: boolean;
  /** Error object if data fetching fails */
  error: Error | null;
}

/**
 * Custom hook to fetch HTML components from the CMS
 *
 * @template T - Component reference type
 * @param path - The component path
 * @param config - Optional configuration overrides for the component
 * @param atmyAppConfig - Optional configuration object from createAtMyApp
 * @returns Object containing the HTML content, loading state, and errors
 */
export function useAmaComponent<C extends AmaComponentRef<any, any>>(
  path: C["path"],
  config?: Partial<AmaComponentConfig>,
  atmyAppConfig?: ReturnType<typeof import("../createAtMyApp").createAtMyApp>
): AmaComponentHook {
  // Use provided config or get from context
  let amaConfig: {
    apiKey: string;
    projectUrl: string;
    cache: Map<string, any>;
  };

  if (atmyAppConfig) {
    amaConfig = atmyAppConfig;
  } else {
    const context = useAmaContext();
    if (!context) {
      throw new Error(
        "useAmaComponent must be used within an AmaProvider or provide a configuration"
      );
    }
    amaConfig = context;
  }

  const { apiKey, projectUrl, cache } = amaConfig;

  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Extract config with defaults
  const componentConfig: AmaComponentConfig = {
    sanitize: true,
    allowedTags: undefined,
    cacheDuration: 3600, // Default cache: 1 hour
    ...config,
  };

  useEffect(() => {
    const fetchComponent = async () => {
      if (!path) {
        setIsLoading(false);
        return;
      }

      // Create cache key
      const cacheKey = `component:${path}`;

      try {
        // Check if we have a valid cached version
        const now = Date.now();
        const cachedComponent = componentCache.get(cacheKey);
        const cacheDurationMs = componentConfig.cacheDuration! * 1000;

        if (
          cachedComponent &&
          (cacheDurationMs === 0 ||
            now - cachedComponent.timestamp < cacheDurationMs)
        ) {
          setHtml(cachedComponent.html);
          setIsLoading(false);
          return;
        }

        // Check if the component is in the context cache
        if (cache.has(cacheKey)) {
          const cachedHtml = cache.get(cacheKey) as string;
          setHtml(cachedHtml);
          setIsLoading(false);

          // Update the component cache with a timestamp
          componentCache.set(cacheKey, {
            html: cachedHtml,
            timestamp: now,
          });
          return;
        }

        // Construct the full URL
        const url = createAmaUrl(projectUrl, path);

        setIsLoading(true);
        setError(null);

        // Fetch the component as text
        const htmlContent = await amaFetch<string>(url, {
          apiKey,
          responseType: "text",
        });

        // Process the HTML
        const processedHtml = componentConfig.sanitize
          ? sanitizeHtml(htmlContent, componentConfig.allowedTags)
          : htmlContent;

        // Store in both caches
        cache.set(cacheKey, processedHtml);
        componentCache.set(cacheKey, {
          html: processedHtml,
          timestamp: now,
        });

        setHtml(processedHtml);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching component:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchComponent();
  }, [
    path,
    apiKey,
    projectUrl,
    cache,
    componentConfig.sanitize,
    componentConfig.allowedTags,
    componentConfig.cacheDuration,
  ]);

  return { html, isLoading, error };
}
