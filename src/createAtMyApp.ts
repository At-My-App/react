import {
  createAtMyAppClient,
  AtMyAppClient,
  AtMyAppClientOptions,
} from "@atmyapp/core";

/**
 * Configuration interface for AtMyApp
 */
export interface AtMyAppConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the AtMyApp project */
  baseUrl: string;
  /** Optional preview key for draft content */
  previewKey?: string;
}

/**
 * Creates an AtMyApp client instance that can be passed to hooks
 * as an alternative to using the AmaProvider
 */
export function createAtMyApp(config: AtMyAppConfig): AtMyAppClient {
  const options: AtMyAppClientOptions = {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    previewKey: config.previewKey,
  };

  return createAtMyAppClient(options);
}
