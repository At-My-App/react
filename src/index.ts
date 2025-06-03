// Re-export core types for convenience
export {
  AmaContentDef,
  AmaImageDef,
  AmaFileDef,
  AmaContent,
  AmaImage,
  AmaFile,
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
export { useAmaAnalytics } from "./hooks/useAmaAnalytics";

// Context
export { AmaProvider, useAmaContext } from "./context/AmaProvider";

// Configuration creator
export { createAtMyApp, type AtMyAppConfig } from "./createAtMyApp";
