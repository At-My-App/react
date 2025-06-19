import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { createAtMyAppClient } from "@atmyapp/core";
import { useAmaImage } from "../useAmaImage";
import { AmaProvider } from "../../context/AmaProvider";
import { ReactNode } from "react";

// Mock the core client
jest.mock("@atmyapp/core");

const mockCreateAtMyAppClient = createAtMyAppClient as jest.Mock;

describe("useAmaImage", () => {
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

  it("should fetch image successfully", async () => {
    const mockSrc = "https://test.atmyapp.com/images/test.jpg";
    mockClient.collections.get.mockResolvedValue({
      isError: false,
      src: mockSrc,
    });

    const { result } = renderHook(() => useAmaImage("/images/test"), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.src).toBe("");
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.src).toBe(mockSrc);
    expect(result.current.error).toBe(null);
    expect(mockClient.collections.get).toHaveBeenCalledWith(
      "/images/test",
      "image"
    );
  });

  it("should handle errors", async () => {
    const errorMessage = "Image not found";
    mockClient.collections.get.mockResolvedValue({
      isError: true,
      errorMessage,
    });

    const { result } = renderHook(() => useAmaImage("/images/error"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.src).toBe("");
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it("should work with client instance", async () => {
    const mockSrc = "https://test.atmyapp.com/images/direct.jpg";
    mockClient.collections.get.mockResolvedValue({
      isError: false,
      src: mockSrc,
    });

    const { result } = renderHook(() =>
      useAmaImage("/images/direct", mockClient as any)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.src).toBe(mockSrc);
    expect(result.current.error).toBe(null);
  });

  it("should handle no client gracefully", () => {
    const { result } = renderHook(() => useAmaImage("/images/no-client"));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.src).toBe("");
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      "AtMyApp client is not available"
    );
  });

  it("should handle empty path", async () => {
    const { result } = renderHook(() => useAmaImage(""), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.src).toBe("");
    expect(result.current.error).toBe(null);
    expect(mockClient.collections.get).not.toHaveBeenCalled();
  });

  it("should handle blob URL cleanup", async () => {
    const mockSrc = "blob:http://localhost/mock-blob-url";
    mockClient.collections.get.mockResolvedValue({
      isError: false,
      src: mockSrc,
    });

    const { result, unmount } = renderHook(() => useAmaImage("/images/blob"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.src).toBe(mockSrc);

    // Unmount to trigger cleanup
    unmount();

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockSrc);
  });
});
