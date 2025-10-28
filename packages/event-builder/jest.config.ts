import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "@nhsdigital/nhs-notify-supplier-config-schemas$":
      "<rootDir>/../../packages/events/src",
  },
};

export default config;
