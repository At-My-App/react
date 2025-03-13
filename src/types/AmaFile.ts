/**
 * Reference type for AMA file resources
 */
export type AmaFileRef<T extends string, C extends AmaFileConfig = {}> = {
  /** The path to the file (e.g. "documents/report.pdf") */
  path: T;
  /** Configuration for the file */
  structure: {
    __amatype: "AmaFileDef";
    __config: C;
  };
  /** Type discriminator for file references */
  type: "file";
};

export interface AmaFileConfig {
  /**
   * Content type (MIME type) of the file (e.g. "application/pdf", "image/png")
   */
  contentType?: string;
}

export type AmaFile<Config extends AmaFileConfig = {}> = {
  src: string;
  isLoading: boolean;
  __amatype: "AmaFile";
  __config: Config;
};
