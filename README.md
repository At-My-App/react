# 🚀 AtMyApp React

[![npm version](https://badge.fury.io/js/%40atmyapp%2Freact.svg)](https://badge.fury.io/js/%40atmyapp%2Freact)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> 🎯 **React hooks for AtMyApp.** The official React library for AtMyApp - AI-powered content management with type-safe hooks.

## 📖 Table of Contents

- [🌟 Features](#-features)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📚 API Reference](#-api-reference)
  - [Provider Setup](#provider-setup)
  - [Content Hooks](#content-hooks)
  - [Analytics Hooks](#analytics-hooks)
- [🧪 Testing](#-testing)
- [💡 Examples](#-examples)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

✨ **Type-Safe Hooks** - React hooks with full TypeScript support  
🔄 **Real-time Content** - Fetch content, images, and files from AtMyApp  
📊 **Built-in Analytics** - Track events with React hooks  
⚡ **Core Library Integration** - Built on @atmyapp/core for consistency  
🎯 **Auto-Caching** - Intelligent caching for optimal performance  
🚀 **Zero Configuration** - Works out of the box with minimal setup

## 📦 Installation

```bash
# npm
npm install @atmyapp/react @atmyapp/core

# yarn
yarn add @atmyapp/react @atmyapp/core

# pnpm
pnpm add @atmyapp/react @atmyapp/core
```

## 🚀 Quick Start

### Option 1: Using Provider (Recommended)

```tsx
import React from "react";
import { AmaProvider, useAmaContent } from "@atmyapp/react";

// Wrap your app with the provider
function App() {
  return (
    <AmaProvider
      apiKey="your-api-key"
      baseUrl="https://api.atmyapp.com"
      previewKey="optional-preview-key"
    >
      <BlogPost />
    </AmaProvider>
  );
}

// Use hooks in your components
function BlogPost() {
  const { data, isLoading, error } = useAmaContent("/blog/latest");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
```

### Option 2: Using Client Instance

```tsx
import React from "react";
import { createAtMyApp, useAmaContent } from "@atmyapp/react";

// Create a client instance
const amaClient = createAtMyApp({
  apiKey: "your-api-key",
  baseUrl: "https://api.atmyapp.com",
});

function BlogPost() {
  const { data, isLoading, error } = useAmaContent("/blog/latest", amaClient);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
```

## 📚 API Reference

### Provider Setup

#### `AmaProvider`

Provides AtMyApp client context to child components.

```tsx
<AmaProvider
  apiKey="your-api-key"
  baseUrl="https://api.atmyapp.com"
  previewKey="optional-preview-key" // For draft content
>
  {children}
</AmaProvider>
```

#### `createAtMyApp(config)`

Creates a client instance for use without provider.

```tsx
const client = createAtMyApp({
  apiKey: "your-api-key",
  baseUrl: "https://api.atmyapp.com",
  previewKey: "optional-preview-key",
});
```

### Content Hooks

#### `useAmaContent<T>(path, client?)`

Fetch typed content from AtMyApp.

```tsx
import { useAmaContent, AmaContentDef } from "@atmyapp/react";

// Define your content type
type BlogPost = AmaContentDef<
  "/blog/post",
  {
    title: string;
    content: string;
    publishedAt: string;
  }
>;

function BlogComponent() {
  const { data, isLoading, error } = useAmaContent<BlogPost>("/blog/post");

  // data is typed as { title: string; content: string; publishedAt: string; }
}
```

#### `useAmaImage<T>(path, client?)`

Fetch optimized images from AtMyApp.

```tsx
import { useAmaImage, AmaImageDef } from "@atmyapp/react";

// Define your image type
type HeroImage = AmaImageDef<
  "/images/hero",
  {
    optimizeFormat: "webp";
    maxSize: { width: 1920; height: 1080 };
  }
>;

function HeroComponent() {
  const { src, isLoading, error } = useAmaImage<HeroImage>("/images/hero");

  if (isLoading) return <div>Loading image...</div>;
  if (error) return <div>Failed to load image</div>;

  return <img src={src} alt="Hero" />;
}
```

#### `useAmaFile<T>(path, client?)`

Fetch files from AtMyApp.

```tsx
import { useAmaFile, AmaFileDef } from "@atmyapp/react";

type DocumentFile = AmaFileDef<
  "/docs/manual.pdf",
  {
    contentType: "application/pdf";
  }
>;

function DocumentComponent() {
  const { src, isLoading, error } =
    useAmaFile<DocumentFile>("/docs/manual.pdf");

  if (isLoading) return <div>Loading document...</div>;
  if (error) return <div>Failed to load document</div>;

  return (
    <a href={src} target="_blank">
      Download Manual
    </a>
  );
}
```

### Analytics Hooks

#### `useAmaAnalytics(client?)`

Access analytics functionality for tracking events.

```tsx
import { useAmaAnalytics } from "@atmyapp/react";

function ProductPage() {
  const analytics = useAmaAnalytics();

  const handleAddToCart = async () => {
    // Track basic event (server collects metadata automatically)
    await analytics.trackBasicEvent("add_to_cart");

    // Track custom event with data
    await analytics.trackEvent("purchase", {
      product_id: "prod_123",
      amount: "99.99",
      currency: "USD",
      user_id: "user_456",
    });
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

## 🧪 Testing

The library includes comprehensive test coverage for all hooks and components. Tests are written using Jest and React Testing Library.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

When testing components that use AtMyApp hooks, wrap them in the `AmaProvider`:

```tsx
import { render } from "@testing-library/react";
import { AmaProvider } from "@atmyapp/react";

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AmaProvider apiKey="test-key" baseUrl="https://test.atmyapp.com">
      {children}
    </AmaProvider>
  );
}

test("my component", () => {
  render(
    <TestWrapper>
      <MyComponent />
    </TestWrapper>
  );

  // Your test assertions...
});
```

Alternatively, provide a client instance directly:

```tsx
import { createAtMyApp } from "@atmyapp/react";

const testClient = createAtMyApp({
  apiKey: "test-key",
  baseUrl: "https://test.atmyapp.com",
});

function MyComponent() {
  const { data } = useAmaContent("/test/path", testClient);
  // Component logic...
}
```

### Mocking AtMyApp

For unit tests, you may want to mock the core library:

```tsx
jest.mock("@atmyapp/core", () => ({
  createAtMyAppClient: jest.fn(() => ({
    collections: {
      get: jest.fn().mockResolvedValue({
        isError: false,
        data: { title: "Mock Content" },
      }),
    },
    analytics: {
      trackBasicEvent: jest.fn().mockResolvedValue(true),
      trackEvent: jest.fn().mockResolvedValue(true),
    },
  })),
}));
```

## 💡 Examples

### E-commerce Product Catalog

```tsx
import React from "react";
import {
  AmaProvider,
  useAmaContent,
  useAmaImage,
  useAmaAnalytics,
  AmaContentDef,
  AmaImageDef,
} from "@atmyapp/react";

// Define types
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

type ProductCatalog = AmaContentDef<"/products/catalog", Product[]>;
type ProductImage = AmaImageDef<
  "/images/products",
  {
    optimizeFormat: "webp";
    maxSize: { width: 400; height: 400 };
  }
>;

function ProductList() {
  const { data: products, isLoading } =
    useAmaContent<ProductCatalog>("/products/catalog");
  const analytics = useAmaAnalytics();

  const handleProductView = async (productId: string) => {
    await analytics.trackBasicEvent("product_view");
    await analytics.trackEvent("product_interaction", {
      product_id: productId,
      action: "view",
      timestamp: new Date().toISOString(),
    });
  };

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="product-grid">
      {products?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={() => handleProductView(product.id)}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  onView,
}: {
  product: Product;
  onView: () => void;
}) {
  const { src: imageSrc } = useAmaImage<ProductImage>(
    `/images/products/${product.id}`
  );

  return (
    <div className="product-card" onClick={onView}>
      <img src={imageSrc} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <p>{product.description}</p>
    </div>
  );
}

function App() {
  return (
    <AmaProvider
      apiKey={process.env.REACT_APP_ATMYAPP_API_KEY!}
      baseUrl={process.env.REACT_APP_ATMYAPP_BASE_URL!}
    >
      <ProductList />
    </AmaProvider>
  );
}
```

### Blog with Analytics

```tsx
import React, { useEffect } from "react";
import { useAmaContent, useAmaAnalytics, AmaContentDef } from "@atmyapp/react";

type BlogPost = AmaContentDef<
  "/blog/posts",
  {
    title: string;
    content: string;
    author: string;
    publishedAt: string;
    tags: string[];
  }
>;

function BlogPostPage({ slug }: { slug: string }) {
  const {
    data: post,
    isLoading,
    error,
  } = useAmaContent<BlogPost>(`/blog/posts/${slug}`);
  const analytics = useAmaAnalytics();

  // Track page view when component mounts
  useEffect(() => {
    analytics.trackBasicEvent("page_view");
    analytics.trackEvent("content_view", {
      content_type: "blog_post",
      content_id: slug,
      timestamp: new Date().toISOString(),
    });
  }, [slug, analytics]);

  const handleShare = async (platform: string) => {
    await analytics.trackBasicEvent("content_share");
    await analytics.trackEvent("social_share", {
      content_id: slug,
      platform,
      content_type: "blog_post",
    });
  };

  if (isLoading) return <div>Loading post...</div>;
  if (error) return <div>Post not found</div>;
  if (!post) return <div>No post data</div>;

  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <p>
          By {post.author} on {post.publishedAt}
        </p>
        <div className="tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="content">{post.content}</div>

      <footer>
        <button onClick={() => handleShare("twitter")}>Share on Twitter</button>
        <button onClick={() => handleShare("facebook")}>
          Share on Facebook
        </button>
      </footer>
    </article>
  );
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[🌐 AtMyApp Website](https://atmyapp.com)** • **[📚 Documentation](https://docs.atmyapp.com)** • **[💬 Support](https://atmyapp.com/support)**

Made with ❤️ by the AtMyApp team

_Build React apps with AtMyApp._

</div>
