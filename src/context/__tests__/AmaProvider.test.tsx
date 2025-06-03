import React from "react";
import { render } from "@testing-library/react";
import { createAtMyAppClient } from "@atmyapp/core";
import { AmaProvider, useAmaContext } from "../AmaProvider";

// Mock the core client
jest.mock("@atmyapp/core");

const mockCreateAtMyAppClient = createAtMyAppClient as jest.Mock;

// Test component to access context
function TestComponent() {
  const context = useAmaContext();

  return (
    <div>
      <span data-testid="client-exists">
        {context.client ? "exists" : "missing"}
      </span>
      <span data-testid="api-key">{context.options.apiKey}</span>
      <span data-testid="base-url">{context.options.baseUrl}</span>
      <span data-testid="preview-key">
        {context.options.previewKey || "none"}
      </span>
    </div>
  );
}

describe("AmaProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock client instance
    const mockClient = {
      collections: { get: jest.fn() },
      analytics: { trackBasicEvent: jest.fn(), trackEvent: jest.fn() },
    };

    mockCreateAtMyAppClient.mockReturnValue(mockClient);
  });

  it("should provide client and options to children", () => {
    const { getByTestId } = render(
      <AmaProvider
        apiKey="test-api-key"
        baseUrl="https://test.atmyapp.com"
        previewKey="test-preview"
      >
        <TestComponent />
      </AmaProvider>
    );

    expect(getByTestId("client-exists").textContent).toBe("exists");
    expect(getByTestId("api-key").textContent).toBe("test-api-key");
    expect(getByTestId("base-url").textContent).toBe(
      "https://test.atmyapp.com"
    );
    expect(getByTestId("preview-key").textContent).toBe("test-preview");
  });

  it("should provide client and options without preview key", () => {
    const { getByTestId } = render(
      <AmaProvider apiKey="test-api-key" baseUrl="https://test.atmyapp.com">
        <TestComponent />
      </AmaProvider>
    );

    expect(getByTestId("client-exists").textContent).toBe("exists");
    expect(getByTestId("api-key").textContent).toBe("test-api-key");
    expect(getByTestId("base-url").textContent).toBe(
      "https://test.atmyapp.com"
    );
    expect(getByTestId("preview-key").textContent).toBe("none");
  });

  it("should create client with correct options", () => {
    render(
      <AmaProvider
        apiKey="test-api-key"
        baseUrl="https://test.atmyapp.com"
        previewKey="test-preview"
      >
        <TestComponent />
      </AmaProvider>
    );

    expect(mockCreateAtMyAppClient).toHaveBeenCalledWith({
      apiKey: "test-api-key",
      baseUrl: "https://test.atmyapp.com",
      previewKey: "test-preview",
    });
  });

  it("should recreate client when props change", () => {
    const { rerender } = render(
      <AmaProvider apiKey="initial-key" baseUrl="https://initial.atmyapp.com">
        <TestComponent />
      </AmaProvider>
    );

    expect(mockCreateAtMyAppClient).toHaveBeenCalledWith({
      apiKey: "initial-key",
      baseUrl: "https://initial.atmyapp.com",
      previewKey: undefined,
    });

    // Clear mock calls
    mockCreateAtMyAppClient.mockClear();

    // Rerender with new props
    rerender(
      <AmaProvider
        apiKey="updated-key"
        baseUrl="https://updated.atmyapp.com"
        previewKey="new-preview"
      >
        <TestComponent />
      </AmaProvider>
    );

    expect(mockCreateAtMyAppClient).toHaveBeenCalledWith({
      apiKey: "updated-key",
      baseUrl: "https://updated.atmyapp.com",
      previewKey: "new-preview",
    });
  });
});

describe("useAmaContext", () => {
  it("should throw error when used outside provider", () => {
    // Mock console.error to avoid noise in test output
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAmaContext must be used within an AmaProvider");

    consoleError.mockRestore();
  });
});
