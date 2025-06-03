// This file is executed once before all test files
// It's useful for setting up global test environment settings

require("@testing-library/jest-dom");

// Mock @atmyapp/core
jest.mock("@atmyapp/core", () => ({
  createAtMyAppClient: jest.fn(() => ({
    collections: {
      get: jest.fn(),
      getFromPath: jest.fn(),
    },
    analytics: {
      trackEvent: jest.fn(),
      trackCustomEvent: jest.fn(),
    },
  })),
  AmaContentDef: {},
  AmaImageDef: {},
  AmaFileDef: {},
  AmaCustomEventDef: {},
  AmaEventDef: {},
}));

// Setup global fetch mock
global.fetch = jest.fn();

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-object-url");
global.URL.revokeObjectURL = jest.fn();
