// Re-export core types for convenience
export {
  AmaContentDef,
  AmaImageDef,
  AmaFileDef,
  AmaIconDef,
  AmaContent,
  AmaImage,
  AmaFile,
  AmaIcon,
  AtMyAppClient,
  AtMyAppClientOptions,
  AmaCustomEvent,
  AmaCustomEventDef,
  AmaEvent,
  AmaEventDef,
} from "@atmyapp/core";

// Hooks
export { useAmaContent } from "./hooks/useAmaContent";
export { useAmaImage } from "./hooks/useAmaImage";
export { useAmaFile } from "./hooks/useAmaFile";
export { useAmaIcon } from "./hooks/useAmaIcon";
export { useAmaAnalytics } from "./hooks/useAmaAnalytics";

// Context
export {
  AmaProvider,
  useAmaContext,
  useAmaContextSafe,
} from "./context/AmaProvider";

// Error Boundary
export {
  AmaErrorBoundary,
  withAmaErrorBoundary,
} from "./components/AmaErrorBoundary";

// Configuration creator
export { createAtMyApp, type AtMyAppConfig } from "./createAtMyApp";
