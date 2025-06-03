import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { createAtMyAppClient } from "@atmyapp/core";
import { useAmaFile } from "../useAmaFile";
import { AmaProvider } from "../../context/AmaProvider";
import { ReactNode } from "react";

// Mock the core client
jest.mock("@atmyapp/core");

const mockCreateAtMyAppClient = createAtMyAppClient as jest.Mock;

describe("useAmaFile", () => {
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

  it("should fetch file successfully", async () => {
    const mockSrc = "https://test.atmyapp.com/files/document.pdf";
    mockClient.collections.get.mockResolvedValue({
      isError: false,
      src: mockSrc,
    });

    const { result } = renderHook(() => useAmaFile("/files/document"), {
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
      "/files/document",
      "file"
    );
  });

  it("should handle errors", async () => {
    const errorMessage = "File not found";
    mockClient.collections.get.mockResolvedValue({
      isError: true,
      errorMessage,
    });

    const { result } = renderHook(() => useAmaFile("/files/error"), {
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
    const mockSrc = "https://test.atmyapp.com/files/direct.pdf";
    mockClient.collections.get.mockResolvedValue({
      isError: false,
      src: mockSrc,
    });

    const { result } = renderHook(() =>
      useAmaFile("/files/direct", mockClient as any)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.src).toBe(mockSrc);
    expect(result.current.error).toBe(null);
  });

  it("should throw error when no client available", () => {
    expect(() => {
      renderHook(() => useAmaFile("/files/no-client"));
    }).toThrow("useAmaContext must be used within an AmaProvider");
  });

  it("should handle empty path", async () => {
    const { result } = renderHook(() => useAmaFile(""), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.src).toBe("");
    expect(result.current.error).toBe(null);
    expect(mockClient.collections.get).not.toHaveBeenCalled();
  });
});
