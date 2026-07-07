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

describe("truncateForComment", () => {
  const footer = "\n\n> truncated, see full report\n";

  // Imported lazily so loading ./to_markdown (and its ./utils import) does not
  // freeze `isDev` at collection time and break the env-dependent tests above.
  test("returns markdown unchanged when it fits within the limit", async () => {
    const { truncateForComment } = await import("../to_markdown.js");
    const markdown = "# Linting Report\n\nAll good.";
    expect(truncateForComment(markdown, footer)).toBe(markdown);
  });

  test("truncates and appends the footer when over the limit", async () => {
    const { truncateForComment, GITHUB_COMMENT_MAX_LENGTH } = await import(
      "../to_markdown.js"
    );
    const markdown = "x\n".repeat(GITHUB_COMMENT_MAX_LENGTH);
    const result = truncateForComment(markdown, footer);

    expect(result.length).toBeLessThanOrEqual(GITHUB_COMMENT_MAX_LENGTH);
    expect(result.endsWith(footer)).toBe(true);
    expect(result.length).toBeLessThan(markdown.length);
  });

  test("cuts on a line boundary", async () => {
    const { truncateForComment } = await import("../to_markdown.js");
    const line = "abcde\n";
    const markdown = line.repeat(20);
    // Force a cut partway through by using a small max length.
    const result = truncateForComment(markdown, footer, 30);
    const body = result.slice(0, result.length - footer.length);
    // Every retained character belongs to a complete line.
    expect(body.length % line.length).toBe(0);
  });

  test("re-closes <details> blocks left open by the cut", async () => {
    const { truncateForComment } = await import("../to_markdown.js");
    const markdown =
      "<details><summary>a</summary>\n" + "line\n".repeat(1000) + "</details>\n";
    const result = truncateForComment(markdown, footer, 120);
    const open = (result.match(/<details/g) || []).length;
    const close = (result.match(/<\/details>/g) || []).length;
    expect(close).toBeGreaterThanOrEqual(open);
  });
});
