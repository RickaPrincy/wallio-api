import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.e2e\\.spec\\.ts$",
  setupFilesAfterEnv: ["<rootDir>/../../jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  testEnvironment: "node",
  moduleNameMapper: {
    "^@wallio/auth$": "<rootDir>/../../src/auth",
    "^@wallio/rest$": "<rootDir>/../../src/rest",
    "^@wallio/entities$": "<rootDir>/../../src/entities",
    "^@wallio/services$": "<rootDir>/../../src/services",
    "^@wallio/modules$": "<rootDir>/../../src/modules",
    "^@wallio/auth/(.*)$": "<rootDir>/../../src/auth/$1",
    "^@wallio/rest/(.*)$": "<rootDir>/../../src/rest/$1",
    "^@wallio/entities/(.*)$": "<rootDir>/../../src/entities/$1",
    "^@wallio/services/(.*)$": "<rootDir>/../../src/services/$1",
    "^@wallio/modules/(.*)$": "<rootDir>/../../src/modules/$1",
  },
};

export default config;
