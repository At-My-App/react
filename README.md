# AtMyApp React Package

A comprehensive React library for integrating with the AtMyApp CMS platform, providing type-safe content, image, file, and HTML component management.

## Features

- 📄 **Content Management**: Fetch and manage JSON content from your AtMyApp CMS
- 🖼️ **Image Handling**: Load and optimize images with automatic caching
- 📁 **File Management**: Download and handle files with proper content types
- 🧩 **HTML Components**: Embed server-rendered HTML components with React integration
- 🔄 **Two-way Communication**: Interact between React and embedded HTML components
- 🔒 **Security**: Built-in HTML sanitization for safely embedding third-party content
- 💾 **Smart Caching**: Efficient caching for improved performance
- 📱 **TypeScript Support**: Fully typed API for better developer experience

## Installation

```bash
npm install @atmyapp/react-package
```

## Setup

Wrap your application with the `AmaProvider` to set up configuration:

```tsx
import { AmaProvider } from "@atmyapp/react-package";

function App() {
  return (
    <AmaProvider
      apiKey="your-api-key"
      projectUrl="https://your-project.atmyapp.com"
    >
      <YourApp />
    </AmaProvider>
  );
}
```

## Type System

AtMyApp uses a powerful type system to provide type safety and intellisense for your content.

### `AmaContentRef`

Used for defining JSON content structures:

```tsx
import { AmaContentRef } from "@atmyapp/react-package";

// Define a content structure
export type HomepageContent = AmaContentRef<
  "homepage/content.json", // Path to the content
  {
    title: string;
    subtitle: string;
    features: Array<{
      title: string;
      description: string;
    }>;
  }
>;
```

### `AmaImageRef`

Used for defining image resources:

```tsx
import { AmaImageRef, AmaImageConfig } from "@atmyapp/react-package";

// Basic image reference
export type LogoImage = AmaImageRef<"images/logo.png">;

// Image with configuration
export type HeroImage = AmaImageRef<
  "images/hero.jpg",
  {
    optimizeFormat: "webp";
    ratioHint: { x: 16; y: 9 };
    maxSize: { width: 1920; height: 1080 };
  }
>;
```

### `AmaComponentRef`

Used for defining HTML component resources:

```tsx
import { AmaComponentRef } from "@atmyapp/react-package";

// Basic component reference
export type HeaderComponent = AmaComponentRef<"components/header.html">;

// Component with configuration
export type UserContentComponent = AmaComponentRef<
  "components/user-content.html",
  {
    sanitize: true;
    allowedTags: string[];
    cacheDuration: number;
  }
>;
```

### `AmaFileRef`

Used for defining file resources:

```tsx
import { AmaFileRef } from "@atmyapp/react-package";

// Basic file reference
export type PdfDocument = AmaFileRef<"documents/guide.pdf">;

// File with custom content type
export type CustomFile = AmaFileRef<
  "data/export.dat",
  {
    contentType: "application/octet-stream";
  }
>;
```

## Hooks

### `useAmaContent`

Fetches JSON content from the CMS:

```tsx
import { useAmaContent } from "@atmyapp/react-package";
import { HomepageContent } from "./types";

function HomePage() {
  const { data, isLoading, error } = useAmaContent<HomepageContent>(
    "homepage/content.json"
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading content</div>;

  return (
    <div>
      <h1>{data.title}</h1>
      <h2>{data.subtitle}</h2>
      {data.features.map((feature, index) => (
        <div key={index}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### `useAmaImage`

Loads and manages images from the CMS:

```tsx
import { useAmaImage } from "@atmyapp/react-package";
import { LogoImage, HeroImage } from "./types";

function ImageExample() {
  // Basic usage
  const logo = useAmaImage<LogoImage>("images/logo.png");

  // With type safety from a reference
  const hero = useAmaImage<HeroImage>("images/hero.jpg");

  if (logo.isLoading || hero.isLoading) return <div>Loading images...</div>;

  return (
    <div>
      <img src={logo.src} alt="Logo" className="logo" />
      <img src={hero.src} alt="Hero" className="hero-image" />
    </div>
  );
}
```

### `useAmaFile`

Manages file resources from the CMS:

```tsx
import { useAmaFile } from "@atmyapp/react-package";
import { PdfDocument } from "./types";

function FileExample() {
  const { url, download, isLoading, error } = useAmaFile<PdfDocument>(
    "documents/guide.pdf"
  );

  if (isLoading) return <div>Loading file...</div>;
  if (error) return <div>Error loading file</div>;

  return (
    <div>
      <a href={url} target="_blank" rel="noopener noreferrer">
        View Document
      </a>
      <button onClick={() => download("user-guide.pdf")}>Download PDF</button>
    </div>
  );
}
```

### `useAmaComponent`

Fetches HTML components from the CMS:

```tsx
import { useAmaComponent } from "@atmyapp/react-package";
import { HeaderComponent } from "./types";

function ComponentExample() {
  const { html, isLoading, error } = useAmaComponent<HeaderComponent>(
    "components/header.html",
    {
      sanitize: true,
      cacheDuration: 3600, // 1 hour in seconds
    }
  );

  if (isLoading) return <div>Loading component...</div>;
  if (error) return <div>Error loading component</div>;

  // Note: Using dangerouslySetInnerHTML directly isn't recommended
  // Use the AmaComponentRenderer component instead (shown below)
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

## Components

### `AmaComponentRenderer`

Renders HTML components with proper configuration and safety:

```tsx
import { AmaComponentRenderer } from "@atmyapp/react-package";

function ComponentRendererExample() {
  return (
    <div>
      {/* Basic usage */}
      <AmaComponentRenderer path="components/header.html" />

      {/* With configuration */}
      <AmaComponentRenderer
        path="components/user-content.html"
        config={{
          sanitize: true,
          allowedTags: ["div", "p", "h1", "h2", "a", "ul", "li"],
          cacheDuration: 1800, // 30 minutes
        }}
        className="user-content-container"
        as="section"
        loadingComponent={<div className="loading-spinner">Loading...</div>}
        errorComponent={<div className="error-message">Failed to load</div>}
      />
    </div>
  );
}
```

## Interactive Components

### Passing Data to HTML Components

```tsx
import {
  AmaComponentRenderer,
  injectComponentData,
} from "@atmyapp/react-package";

function UserProfile({ userId, username, isAdmin }) {
  // Create data attributes to pass to the HTML component
  const userData = injectComponentData({
    userId,
    username,
    isAdmin,
    lastLogin: new Date().toISOString(),
  });

  return (
    <AmaComponentRenderer
      path="components/profile.html"
      {...userData} // Passes as data-ama-userId, data-ama-username, etc.
    />
  );
}
```

Inside the HTML component:

```html
<div class="profile-widget">
  <script>
    // Get the parent component container
    const container = document.currentScript.parentElement;

    // Get data passed from React via data attributes
    const userId = container.getAttribute("data-ama-userId");
    const username = container.getAttribute("data-ama-username");
    const isAdmin = container.getAttribute("data-ama-isAdmin") === "true";
    const lastLogin = container.getAttribute("data-ama-lastLogin");

    // Use the data in your component
    document.getElementById("username").textContent = username;
    document.getElementById("user-id").textContent = userId;

    if (isAdmin) {
      document.getElementById("admin-badge").style.display = "inline-block";
    }
  </script>

  <div class="user-info">
    <span id="username"></span>
    <span id="admin-badge" style="display: none;">Admin</span>
    <small>ID: <span id="user-id"></span></small>
  </div>
</div>
```

### Two-way Communication

React component with event handling:

```tsx
import React, { useState, useEffect } from "react";
import {
  AmaComponentRenderer,
  listenToComponentEvent,
  sendToComponent,
} from "@atmyapp/react-package";

function InteractiveWidget() {
  const [count, setCount] = useState(0);
  const [lastAction, setLastAction] = useState("");

  // Listen for events from the HTML component
  useEffect(() => {
    // Setup event listener
    const cleanup = listenToComponentEvent<{
      action: string;
      timestamp: number;
    }>("component:action", (data) => {
      console.log("Action from HTML component:", data);
      setLastAction(
        `${data.action} at ${new Date(data.timestamp).toLocaleTimeString()}`
      );

      if (data.action === "increment") {
        setCount((prev) => prev + 1);
      } else if (data.action === "reset") {
        setCount(0);
      }
    });

    // Return cleanup function to remove event listener
    return cleanup;
  }, []);

  // Send updates to the HTML component when count changes
  useEffect(() => {
    sendToComponent("react:stateUpdate", {
      count,
      timestamp: Date.now(),
    });
  }, [count]);

  return (
    <div className="interactive-widget">
      <div className="react-section">
        <h3>React Side</h3>
        <p>Count: {count}</p>
        <button onClick={() => setCount((prev) => prev + 1)}>
          Increment from React
        </button>
        <button onClick={() => setCount(0)}>Reset</button>
        {lastAction && <p>Last action from component: {lastAction}</p>}
      </div>

      <AmaComponentRenderer
        path="components/counter-widget.html"
        config={{ sanitize: false }} // Allow scripts in trusted components
      />
    </div>
  );
}
```

HTML component with event handling:

```html
<div class="counter-widget">
  <h3>HTML Component Side</h3>
  <p>Count value: <span id="count-display">0</span></p>

  <div class="buttons">
    <button id="increment-btn">Increment Counter</button>
    <button id="reset-btn">Reset Counter</button>
  </div>

  <div class="event-log">
    <h4>Event Log:</h4>
    <ul id="event-list"></ul>
  </div>

  <script>
    // Initialize counter value
    let counterValue = 0;

    // Add event to log
    function logEvent(message) {
      const eventList = document.getElementById("event-list");
      const logItem = document.createElement("li");
      logItem.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
      eventList.prepend(logItem);

      // Keep only the latest 5 events
      while (eventList.children.length > 5) {
        eventList.removeChild(eventList.lastChild);
      }
    }

    // Handle increment button click
    document.getElementById("increment-btn").addEventListener("click", () => {
      // Send event to React
      window.dispatchEvent(
        new CustomEvent("component:action", {
          detail: {
            action: "increment",
            timestamp: Date.now(),
          },
          bubbles: true,
        })
      );

      logEvent("Increment requested");
    });

    // Handle reset button click
    document.getElementById("reset-btn").addEventListener("click", () => {
      // Send event to React
      window.dispatchEvent(
        new CustomEvent("component:action", {
          detail: {
            action: "reset",
            timestamp: Date.now(),
          },
          bubbles: true,
        })
      );

      logEvent("Reset requested");
    });

    // Listen for React events
    window.addEventListener("react:stateUpdate", (event) => {
      counterValue = event.detail.count;
      document.getElementById("count-display").textContent = counterValue;
      logEvent(`Updated from React: ${counterValue}`);
    });

    // Log initial load
    logEvent("Component initialized");
  </script>

  <style>
    .counter-widget {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      font-family: system-ui, sans-serif;
    }

    .buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .event-log {
      background-color: #f5f5f5;
      border-radius: 4px;
      padding: 8px;
      font-size: 12px;
      max-height: 150px;
      overflow-y: auto;
    }
  </style>
</div>
```

## Utility Functions

### Content and Image URLs

```tsx
import { createAmaUrl } from "@atmyapp/react-package";

// Generate a full URL to an AtMyApp resource
const imageUrl = createAmaUrl("https://project.atmyapp.com", "images/logo.png");
// => 'https://project.atmyapp.com/images/logo.png'
```

### HTML Sanitization

```tsx
import { sanitizeHtml } from "@atmyapp/react-package";

// Sanitize potentially unsafe HTML
const userHtml = '<div>User content <script>alert("XSS")</script></div>';
const safeHtml = sanitizeHtml(userHtml);
// => '<div>User content </div>' (script tag removed)

// Customize allowed tags
const customSanitized = sanitizeHtml(
  '<div><h1>Title</h1><iframe src="..."></iframe></div>',
  ["div", "h1", "p", "a", "strong", "em"]
);
// => '<div><h1>Title</h1></div>' (iframe removed)
```

### Component Interoperability

```tsx
import {
  injectComponentData,
  listenToComponentEvent,
  sendToComponent,
} from "@atmyapp/react-package";

// Create data attributes for components
const attributes = injectComponentData({
  userId: 123,
  theme: "dark",
  isAdmin: true,
});
// => { 'data-ama-userId': '123', 'data-ama-theme': 'dark', 'data-ama-isAdmin': 'true' }

// Listen for events from HTML components
const cleanup = listenToComponentEvent("component:buttonClick", (data) => {
  console.log("Button clicked:", data);
});

// Send data to HTML components
sendToComponent("react:themeChange", { theme: "light" });
```

## Configuration Options

### `AmaImageConfig`

Options for image optimization and handling:

```typescript
interface AmaImageConfig {
  // Format optimization: webp or none
  optimizeFormat?: "webp" | "none";

  // Progressive loading: progressive or none
  optimizeLoad?: "progressive" | "none";

  // Aspect ratio hint for cropping/resizing
  ratioHint?: {
    x: number;
    y: number;
  };

  // Maximum dimensions for the image
  maxSize?: {
    width: number;
    height: number;
  };
}
```

### `AmaComponentConfig`

Options for HTML component handling:

```typescript
interface AmaComponentConfig {
  // Whether to sanitize HTML (default: true)
  sanitize?: boolean;

  // Allowed HTML tags when sanitizing
  allowedTags?: string[];

  // Cache duration in seconds (default: 3600)
  cacheDuration?: number;
}
```

### `AmaFileConfig`

Options for file handling:

```typescript
interface AmaFileConfig {
  // Override content type for the file
  contentType?: string;

  // Cache duration in seconds (default: 3600)
  cacheDuration?: number;
}
```

## Security Considerations

### HTML Components

- By default, all HTML components are sanitized to remove potentially dangerous elements
- For trusted sources, you can disable sanitization with `sanitize: false`
- When sanitization is enabled, only a safe subset of HTML tags are allowed
- You can customize allowed tags with the `allowedTags` option
- Scripts in components will only run if sanitization is disabled

### Content Security

- All API requests are authenticated with your API key
- Content is cached for improved performance and reduced API calls
- TypeScript definitions ensure type safety for your content structures

## Advanced Usage

### Custom Caching Strategy

You can customize the caching behavior for different resources:

```tsx
<AmaProvider
  apiKey="your-api-key"
  projectUrl="https://your-project.atmyapp.com"
  defaultCacheDuration={1800} // 30 minutes default cache
>
  <YourApp />
</AmaProvider>
```

### Combining Multiple Resource Types

Example using multiple AtMyApp resource types together:

```tsx
import {
  useAmaContent,
  useAmaImage,
  AmaComponentRenderer,
} from "@atmyapp/react-package";
import { ProductContent, ProductImage, ReviewsComponent } from "./types";

function ProductPage({ productId }) {
  // Fetch product details
  const { data: product, isLoading: loadingProduct } =
    useAmaContent<ProductContent>(`products/${productId}/data.json`);

  // Load product image
  const { src: imageSrc, isLoading: loadingImage } = useAmaImage<ProductImage>(
    `products/${productId}/image.jpg`
  );

  if (loadingProduct || loadingImage) {
    return <div>Loading product...</div>;
  }

  return (
    <div className="product-page">
      <h1>{product.name}</h1>
      <img src={imageSrc} alt={product.name} />
      <p>{product.description}</p>
      <div className="price">${product.price.toFixed(2)}</div>

      {/* Embedded reviews component */}
      <h2>Customer Reviews</h2>
      <AmaComponentRenderer
        path={`products/${productId}/reviews.html`}
        config={{ cacheDuration: 300 }} // 5 minutes cache
      />
    </div>
  );
}
```

## TypeScript Support

This package is written in TypeScript and provides full type safety. It requires:

- TypeScript 4.1+
- ES2015 target or higher
- DOM library

## License

MIT
