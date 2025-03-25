import React from "react";
import { useAmaComponent } from "../hooks/useAmaComponent";
import { AmaComponentRef, AmaComponentConfig } from "../types/AmaComponent";

interface AmaComponentRendererProps<C extends AmaComponentRef<any, any>> {
  /** The component reference path */
  path: C["path"];
  /** Optional configuration overrides */
  config?: Partial<AmaComponentConfig>;
  /** Additional class name for the component wrapper */
  className?: string;
  /** HTML tag to use for the wrapper, defaults to div */
  as?: keyof JSX.IntrinsicElements;
  /** Loading placeholder */
  loadingComponent?: React.ReactNode;
  /** Error placeholder */
  errorComponent?: React.ReactNode;
  /** Any additional props will be passed to the wrapper element */
  [key: string]: any;
}

/**
 * Component for rendering HTML components from the CMS
 * Uses dangerouslySetInnerHTML to embed the content
 */
export function AmaComponentRenderer<C extends AmaComponentRef<any, any>>({
  path,
  config,
  className = "",
  as: Component = "div",
  loadingComponent = <div>Loading...</div>,
  errorComponent = <div>Error loading component</div>,
  ...props
}: AmaComponentRendererProps<C>): JSX.Element {
  const { html, isLoading, error } = useAmaComponent(path, config);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error || !html) {
    return <>{errorComponent}</>;
  }

  // Extract standard HTML props from additional props
  const {
    // Props we don't want to pass to the DOM element
    config: _,
    path: __,
    loadingComponent: ___,
    errorComponent: ____,
    ...htmlProps
  } = props;

  // Using the specified component type (defaulting to div)
  return (
    <Component
      className={`ama-component ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      {...htmlProps}
    />
  );
}

/**
 * Example usage:
 *
 * ```tsx
 * <AmaComponentRenderer
 *   path="components/header.html"
 *   config={{
 *     sanitize: true,
 *     allowedTags: ['div', 'h1', 'p', 'a', 'button']
 *   }}
 *   className="my-header"
 *   as="section"
 *   data-custom-attr="value"
 * />
 * ```
 */
