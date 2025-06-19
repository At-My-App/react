import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle errors in AtMyApp hooks
 * Prevents the entire app from crashing when an error occurs
 */
export class AmaErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error("AtMyApp Error Boundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "20px",
              border: "1px solid #ff6b6b",
              borderRadius: "4px",
              backgroundColor: "#ffe0e0",
              color: "#d63031",
            }}
          >
            <h3>Something went wrong with AtMyApp</h3>
            <p>
              There was an error loading the content. Please try refreshing the
              page.
            </p>
            <details style={{ marginTop: "10px" }}>
              <summary>Error details</summary>
              <pre style={{ fontSize: "12px", marginTop: "10px" }}>
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component that wraps a component with AmaErrorBoundary
 */
export function withAmaErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <AmaErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </AmaErrorBoundary>
  );

  WrappedComponent.displayName = `withAmaErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
