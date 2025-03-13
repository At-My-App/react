## Implementation Details

The package provides these core capabilities:

- Context provider system for AMA configuration
- Image handling with automatic object URL management:
  - Base64 hashing of image data
  - Memory-efficient blob storage
  - Lifecycle cleanup of object URLs
- Type-safe API interactions
- Cache management for API responses

Requires TypeScript 5.4+ with ES2015 target and downlevelIteration enabled.

```typescript
{
  description: string; // Description of the project
  definitions: Record<string, {
    structure: JSONSchema7;
    args: Record<string, string>;
  }[]; // List of files and their definitions
  args: Record<string, string>;
}
```

### Requirements

- Allow to access the AMA project (use cli access token, project has to be first created)

  - Usage: ama use --token <token>
  - On successful authentication, generate the ama.json file in the root of the project

- Migrate the definitions:
  - Usage: ama migrate
  - It scans all the files (if not set otherwise in the ama.json file) and migrates the definitions to the AtMyApp platform

### Types

```typescript
type AmaImage = {
  optimizeFormat?: "webp" | "none"; // Default is "webp"
  optimizeLoad?: "progressive" | "none"; // Default is "progressive" - first loads smaller sizes and then enhances them progressively
  ratioHint?: {
    x: number;
    y: number;
  }; // Eg. {x: 1, y: 1} for 1:1 ratio (square) or {x: 16, y: 9} for 16:9 ratio
  maxSize?: {
    width: number;
    height: number;
  };
};
```

```typescript
interface AmaDataRef<T extends string, D> {
  path: T;
  structure: D;
  type: "collection";
}
```

### Hooks

#### useAmaCollection

```typescript
interface AmaCollectionOptions {
  /**
   * Override API key from context
   */
  apiKey?: string;
  /**
   * Override project ID from context
   */
  projectId?: string;
  /**
   * Custom path override for collection
   */
  path?: string;
  /**
   * Auto-refresh interval in milliseconds
   * @default 0 (no auto-refresh)
   */
  refreshInterval?: number;
}

interface AmaCollectionHook<T> {
  /** Collection data */
  data: T;
  /** Loading state */
  isLoading: boolean;
  /** Error object if request failed */
  error: Error | null;
}

function useAmaCollection<T extends AmaDataRef<string, unknown>>(
  options?: AmaCollectionOptions
): AmaCollectionHook<T>;
```

Example usage:

```typescript
export type LandingContentRef = AmaDataRef<
  "landing/content.json",
  {
    title: string;
    description: string;
    image: AmaImageDef;
  }
>;

const { data, isLoading, error } = useAmaCollection<LandingContentRef>();
```

### Context

We also have a context that can be used to set the apiKey and projectId for the ama-react package. It is also used for caching the data from the AtMyApp platform.

### How migration works

1. Scans all the files in the project (or the ones specified in the ama.json file) for types starting with _AMA_
2. Use typescript-json-schema to generate JSON schemas of the collections defined there
3. Generate the ama.definitions.json file and upload it to the AtMyApp platform

## Implementation Details

The package provides these core capabilities:

- Context provider system for AMA configuration
- Image handling with automatic object URL management:
  - Base64 hashing of image data
  - Memory-efficient blob storage
  - Lifecycle cleanup of object URLs
- Type-safe API interactions
- Cache management for API responses

Requires TypeScript 5.4+ with ES2015 target and downlevelIteration enabled.
