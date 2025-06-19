import React from "react";
import { renderHook } from "@testing-library/react";
import { createAtMyAppClient } from "@atmyapp/core";
import { useAmaAnalytics } from "../useAmaAnalytics";
import { AmaProvider } from "../../context/AmaProvider";
import { ReactNode } from "react";

// Mock the core client
jest.mock("@atmyapp/core");

const mockCreateAtMyAppClient = createAtMyAppClient as jest.Mock;

describe("useAmaAnalytics", () => {
  const mockClient = {
    collections: {
      get: jest.fn(),
      getFromPath: jest.fn(),
    },
    analytics: {
      trackEvent: jest.fn(),
      trackCustomEvent: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateAtMyAppClient.mockReturnValue(mockClient);
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AmaProvider apiKey="test-key" baseUrl="https://test.atmyapp.com">
      {children}
    </AmaProvider>
  );

  it("should track basic events successfully", async () => {
    mockClient.analytics.trackEvent.mockResolvedValue(true);

    const { result } = renderHook(() => useAmaAnalytics(), {
      wrapper,
    });

    const success = await result.current.trackEvent("page_view");

    expect(success).toBe(true);
    expect(mockClient.analytics.trackEvent).toHaveBeenCalledWith("page_view");
  });

  it("should track custom events successfully", async () => {
    mockClient.analytics.trackCustomEvent.mockResolvedValue(true);

    const { result } = renderHook(() => useAmaAnalytics(), {
      wrapper,
    });

    const eventData = {
      product_id: "prod_123",
      amount: "99.99",
      user_id: "user_456",
    };

    const success = await result.current.trackCustomEvent(
      "purchase",
      eventData
    );

    expect(success).toBe(true);
    expect(mockClient.analytics.trackCustomEvent).toHaveBeenCalledWith(
      "purchase",
      eventData
    );
  });

  it("should handle basic event tracking errors", async () => {
    mockClient.analytics.trackEvent.mockResolvedValue(false);

    const { result } = renderHook(() => useAmaAnalytics(), {
      wrapper,
    });

    const success = await result.current.trackEvent("failed_event");

    expect(success).toBe(false);
    expect(mockClient.analytics.trackEvent).toHaveBeenCalledWith(
      "failed_event"
    );
  });

  it("should handle custom event tracking errors", async () => {
    mockClient.analytics.trackCustomEvent.mockResolvedValue(false);

    const { result } = renderHook(() => useAmaAnalytics(), {
      wrapper,
    });

    const success = await result.current.trackCustomEvent("failed_event", {
      test: "data",
    });

    expect(success).toBe(false);
    expect(mockClient.analytics.trackCustomEvent).toHaveBeenCalledWith(
      "failed_event",
      {
        test: "data",
      }
    );
  });

  it("should work with client instance", async () => {
    mockClient.analytics.trackEvent.mockResolvedValue(true);

    const { result } = renderHook(() => useAmaAnalytics(mockClient as any));

    const success = await result.current.trackEvent("direct_event");

    expect(success).toBe(true);
    expect(mockClient.analytics.trackEvent).toHaveBeenCalledWith(
      "direct_event"
    );
  });

  it("should handle no client gracefully", () => {
    const { result } = renderHook(() => useAmaAnalytics());

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error?.message).toBe(
      "useAmaContext must be used within an AmaProvider"
    );
  });

  it("should track custom events with array data", async () => {
    mockClient.analytics.trackCustomEvent.mockResolvedValue(true);

    const { result } = renderHook(() => useAmaAnalytics(), {
      wrapper,
    });

    const arrayData = ["value1", "value2", "value3"];
    const success = await result.current.trackCustomEvent(
      "array_event",
      arrayData
    );

    expect(success).toBe(true);
    expect(mockClient.analytics.trackCustomEvent).toHaveBeenCalledWith(
      "array_event",
      arrayData
    );
  });
});
