# Specyfication:

## Hooks:

### useAmaFile

#### Configuration

```typescript
interface AmaFileConfig {
  /**
   * Content type (MIME type) of the file (e.g. "application/pdf", "image/png")
   */
  contentType?: string;
}
```

#### Hook

```typescript
export function useAmaFile<C extends AmaFileRef<any, any>>(
  path: C["path"],
  options?: AmaFileOptions
): AmaFileHook;
```

#### Hook return type

```typescript
interface AmaFileHook {
  data: ArrayBuffer | null; // File data as ArrayBuffer
  isLoading: boolean; // True while data is being fetched
  error: Error | null; // Error object if data fetching fails
}
```

### useAmaIcon

#### Hook

```typescript
export function useAmaIcon<T extends AmaIconDef<string>>(
  path: T["path"],
  client?: AtMyAppClient
): AmaIconHook;
```

#### Hook return type

```typescript
interface AmaIconHook {
  src: string; // Icon URL
  isLoading: boolean; // True while data is being fetched
  error: Error | null; // Error object if data fetching fails
}
```

### useAmaContent

```typescript

```

### useAmaImage
