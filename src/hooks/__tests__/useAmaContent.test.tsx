import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { createAtMyAppClient } from "@atmyapp/core";
import { useAmaContent } from "../useAmaContent";
import { AmaProvider } from "../../context/AmaProvider";
import { ReactNode } from "react";

// Mock the core client
jest.mock("@atmyapp/core");

const mockCreateAtMyAppClient = createAtMyAppClient as jest.Mock;

describe("useAmaContent", () => {
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

  it("should fetch content successfully", async () => {
    const mockData = { title: "Test Title", content: "Test Content" };
    mockClient.collections.get.mockResolvedValue({
      isError: false,
      data: mockData,
    });

    const { result } = renderHook(() => useAmaContent("/test/content"), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(mockClient.collections.get).toHaveBeenCalledWith(
      "/test/content",
      "content"
    );
  });

  it("should handle errors", async () => {
    const errorMessage = "Content not found";
    mockClient.collections.get.mockResolvedValue({
      isError: true,
      errorMessage,
    });

    const { result } = renderHook(() => useAmaContent("/test/error"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it("should work with client instance", async () => {
    const mockData = { title: "Direct Client Test" };
    mockClient.collections.get.mockResolvedValue({
      isError: false,
      data: mockData,
    });

    const { result } = renderHook(() =>
      useAmaContent("/test/direct", mockClient as any)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it("should handle no client gracefully", () => {
    const { result } = renderHook(() => useAmaContent("/test/no-client"));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      "AtMyApp client is not available"
    );
  });

  it("should handle empty path", async () => {
    const { result } = renderHook(() => useAmaContent(""), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(mockClient.collections.get).not.toHaveBeenCalled();
  });
});
