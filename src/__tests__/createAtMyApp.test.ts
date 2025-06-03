import { createAtMyAppClient } from "@atmyapp/core";
import { createAtMyApp } from "../createAtMyApp";

// Mock the core client
jest.mock("@atmyapp/core");

const mockCreateAtMyAppClient = createAtMyAppClient as jest.Mock;

describe("createAtMyApp", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock client instance
    const mockClient = {
      collections: { get: jest.fn() },
      analytics: { trackEvent: jest.fn(), trackCustomEvent: jest.fn() },
    };

    mockCreateAtMyAppClient.mockReturnValue(mockClient);
  });

  it("should create client with basic config", () => {
    const config = {
      apiKey: "test-api-key",
      baseUrl: "https://test.atmyapp.com",
    };

    const client = createAtMyApp(config);

    expect(mockCreateAtMyAppClient).toHaveBeenCalledWith({
      apiKey: "test-api-key",
      baseUrl: "https://test.atmyapp.com",
      previewKey: undefined,
    });

    expect(client).toBeDefined();
  });

  it("should create client with preview key", () => {
    const config = {
      apiKey: "test-api-key",
      baseUrl: "https://test.atmyapp.com",
      previewKey: "test-preview-key",
    };

    const client = createAtMyApp(config);

    expect(mockCreateAtMyAppClient).toHaveBeenCalledWith({
      apiKey: "test-api-key",
      baseUrl: "https://test.atmyapp.com",
      previewKey: "test-preview-key",
    });

    expect(client).toBeDefined();
  });

  it("should return the same client instance from core library", () => {
    const mockClient = {
      collections: { get: jest.fn() },
      analytics: { trackEvent: jest.fn(), trackCustomEvent: jest.fn() },
    };

    mockCreateAtMyAppClient.mockReturnValue(mockClient);

    const config = {
      apiKey: "test-api-key",
      baseUrl: "https://test.atmyapp.com",
    };

    const client = createAtMyApp(config);

    expect(client).toBe(mockClient);
  });

  it("should handle different base URLs", () => {
    const configs = [
      {
        apiKey: "key1",
        baseUrl: "https://api1.atmyapp.com",
      },
      {
        apiKey: "key2",
        baseUrl: "https://api2.atmyapp.com",
      },
    ];

    configs.forEach((config) => {
      createAtMyApp(config);
    });

    expect(mockCreateAtMyAppClient).toHaveBeenCalledTimes(2);
    expect(mockCreateAtMyAppClient).toHaveBeenNthCalledWith(1, {
      apiKey: "key1",
      baseUrl: "https://api1.atmyapp.com",
      previewKey: undefined,
    });
    expect(mockCreateAtMyAppClient).toHaveBeenNthCalledWith(2, {
      apiKey: "key2",
      baseUrl: "https://api2.atmyapp.com",
      previewKey: undefined,
    });
  });
});
