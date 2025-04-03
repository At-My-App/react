/**
 * Configuration interface for AtMyApp
 */
export interface AtMyAppConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the AtMyApp project */
  projectUrl: string;
  /** Optional cache duration in seconds */
  defaultCacheDuration?: number;
}

/**
 * Creates an AtMyApp configuration object that can be passed to hooks
 * as an alternative to using the AmaProvider
 */
export function createAtMyApp(config: AtMyAppConfig) {
  return {
    apiKey: config.apiKey,
    projectUrl: config.projectUrl,
    cache: new Map<string, any>(),
    defaultCacheDuration: config.defaultCacheDuration || 3600,
  };
}
