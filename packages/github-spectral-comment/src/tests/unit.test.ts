import { afterEach, describe, expect, test, vi } from "vitest";
import { ActionInputs } from "../types.js";

describe("validateInputs", () => {
  // Import the module inside each test after setting the environment
  test("should throw error for missing inputs in prod", async () => {
    vi.stubEnv('NODE_ENV', 'production');
    
    // Import after setting the environment
    const { validateInputs } = await import("../action.js");
    
    const inputs: ActionInputs = {
      "github-token": undefined,
      "file-glob": "test.yaml",
    };

    await expect(validateInputs(inputs)).rejects.toThrow(
      "Missing required inputs",
    );
  });

  test("should not throw error for missing inputs in dev", async () => {
    vi.stubEnv('NODE_ENV', 'development');
    
    // Import after setting the environment
    const { validateInputs } = await import("../action.js");
    
    const inputs: ActionInputs = {
      "github-token": undefined,
      "file-glob": "test.yaml",
    };

    await expect(validateInputs(inputs)).resolves.toBeUndefined();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules(); // Clear module cache
  });
});
