/**
 * Reference type for AMA image resources
 */
export type AmaImageRef<T extends string, C extends AmaImageConfig = {}> = {
  /** The path to the image (e.g. "images/logo.png") */
  path: T;
  /** Configuration for the image */
  structure: {
    __amatype: "AmaImageDef";
    __config: C;
  };
  /** Type discriminator for image references */
  type: "image";
};

export interface AmaImageConfig {
  /**
   * "webp" or "none"
   */
  optimizeFormat?: "webp" | "none";
  /**
   * progressive or none
   */
  optimizeLoad?: "progressive" | "none";
  ratioHint?: {
    x: number;
    y: number;
  };
  maxSize?: {
    width: number;
    height: number;
  };
}

export type AmaImage<Config extends AmaImageConfig = {}> = {
  src: string;
  isLoading: boolean;
  __amatype: "AmaImageDef";
  __config: Config;
};
