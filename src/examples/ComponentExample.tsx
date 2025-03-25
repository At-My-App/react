import React from "react";
import { AmaComponentRenderer } from "../components/AmaComponentRenderer";
import { AmaComponentRef } from "../types/AmaComponent";

// Define your component reference types for better TypeScript support
type HeaderComponent = AmaComponentRef<
  "components/header.html",
  {
    sanitize: boolean;
  }
>;

type FooterComponent = AmaComponentRef<
  "components/footer.html",
  {
    cacheDuration: number;
  }
>;

export function ComponentExample(): JSX.Element {
  return (
    <div className="example-page">
      {/* Basic usage */}
      <AmaComponentRenderer path="components/header.html" />

      {/* Using a different HTML element and custom class */}
      <AmaComponentRenderer
        path="components/sidebar.html"
        as="aside"
        className="site-sidebar"
      />

      {/* With configuration overrides */}
      <AmaComponentRenderer
        path="components/user-content.html"
        config={{
          sanitize: true,
          allowedTags: [
            "div",
            "p",
            "h1",
            "h2",
            "a",
            "ul",
            "li",
            "strong",
            "em",
          ],
          cacheDuration: 0, // Disable caching for this component
        }}
      />

      {/* With custom loading state */}
      <AmaComponentRenderer
        path="components/footer.html"
        loadingComponent={
          <div className="loading-spinner">Loading footer...</div>
        }
        errorComponent={
          <div className="error-message">
            Failed to load footer. Please try again.
          </div>
        }
      />
    </div>
  );
}
