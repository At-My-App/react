/**
 * Represents a reference to an AMA content with strict typing
 * @template T - Literal string type for the content path
 * @template D - Content structure type for the content content
 */
export type AmaContentRef<T extends string, D> = {
  /** The path to the content file (e.g. "landing/content.json") */
  path: T;
  /** JSON schema defining the content's data structure */
  structure: D;
  /** Type discriminator for content references */
  type: "content";
};
