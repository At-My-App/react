import { AmaFileConfig } from "../types/AmaFile";
import { AmaImageConfig } from "../types/AmaImage";

type FetchOptions = {
  apiKey: string;
  token?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  responseType?: "json" | "arraybuffer" | "blob" | "text";
  skipBrowserCheck?: boolean;
  amaPreviewKey?: string;
};

/**
 * Creates a complete URL by combining the base URL with a path
 */
export const createAmaUrl = (baseUrl: string, path: string): string => {
  // Remove trailing slash from baseUrl if present
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  // Remove leading slash from path if present
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBaseUrl}/${normalizedPath}`;
};

/**
 * Reusable function to make authenticated requests to AMA API
 */
export const amaFetch = async <T>(
  url: string,
  options: FetchOptions
): Promise<T> => {
  const {
    apiKey,
    method = "GET",
    headers = {},
    body,
    responseType = "json",
  } = options;

  // NEW CODE: Safely append amaPreviewKey as a query param
  let previewKey: string | undefined = options.amaPreviewKey;
  if (
    !previewKey &&
    !options.skipBrowserCheck &&
    typeof window !== "undefined"
  ) {
    const params = new URLSearchParams(window.location.search);
    previewKey = params.get("amaPreviewKey") || undefined;
  }
  if (previewKey) {
    try {
      const base =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "http://localhost";
      const urlObj = new URL(url, base);
      urlObj.searchParams.set("amaPreviewKey", previewKey);
      url = urlObj.toString();
    } catch (e) {
      // If URL parsing fails, proceed with the original url
    }
  }

  // Set up authentication headers
  const authHeaders: Record<string, string> = {
    ...headers,
  };

  // Add token if provided
  if (apiKey) {
    authHeaders["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    switch (responseType) {
      case "json":
        return (await response.json()) as T;
      case "arraybuffer":
        return (await response.arrayBuffer()) as unknown as T;
      case "blob":
        return (await response.blob()) as unknown as T;
      case "text":
        return (await response.text()) as unknown as T;
      default:
        return (await response.json()) as T;
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Unknown error during fetch");
  }
};

/**
 * Utility to get content type from file path or config
 */
export const getContentType = (
  path: string,
  config?: AmaFileConfig | AmaImageConfig
): string => {
  // Check for contentType on AmaFileConfig
  if (config && "contentType" in config && config.contentType) {
    return config.contentType;
  }

  // Try to infer from file extension
  const extension = path.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    case "json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
};
