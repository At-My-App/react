/**
 * Reference type for AMA component resources
 * @template T - Literal string type for the component path
 * @template C - Component configuration type
 */
export type AmaComponentRef<
  T extends string,
  C extends AmaComponentConfig = {}
> = {
  /** The path to the component (e.g. "components/header.html") */
  path: T;
  /** Configuration for the component */
  structure: {
    __amatype: "AmaComponentDef";
    __config: C;
  };
  /** Type discriminator for component references */
  type: "component";
};

export interface AmaComponentConfig {
  /**
   * Whether to sanitize the HTML content
   * Set to false only when you trust the source completely
   */
  sanitize?: boolean;

  /**
   * Allowed HTML tags when sanitizing
   * Only used when sanitize is true
   */
  allowedTags?: string[];

  /**
   * Cache the component for this duration (in seconds)
   * Set to 0 to disable caching
   */
  cacheDuration?: number;
}

export type AmaComponent = {
  html: string;
  isLoading: boolean;
  __amatype: "AmaComponentDef";
};
