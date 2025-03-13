module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/__tests__/**/*.spec.js"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
    "^.+\\.jsx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
