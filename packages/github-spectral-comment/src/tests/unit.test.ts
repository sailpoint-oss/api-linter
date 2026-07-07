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

describe("parseAddedLines", () => {
  test("captures added lines from the real roles-v1 edit", async () => {
    const { parseAddedLines } = await import("../diff.js");
    // The user's actual PR hunk: two lines replaced starting at new-file 3067.
    const patch = [
      "@@ -3067,8 +3067,8 @@ sp-gateway:",
      "     rateLimitIntervalSeconds: 10",
      '   - id: "roles-v1"',
      '     path: "/roles/v1"',
      '-    service: "ears"',
      '-    servicePath: "/v3/roles"',
      '+    service: "gov-role"',
      '+    servicePath: "/roles"',
      '     routeType: "prefix"',
      "     stripPrefix: true",
      '     apiState: "public"',
    ].join("\n");
    expect([...parseAddedLines(patch)].sort((a, b) => a - b)).toEqual([
      3070, 3071,
    ]);
  });

  test("handles multiple hunks and pure additions", async () => {
    const { parseAddedLines } = await import("../diff.js");
    const patch = [
      "@@ -0,0 +1,2 @@",
      "+first",
      "+second",
      "@@ -10,2 +12,3 @@",
      " context",
      "+inserted",
      " context",
    ].join("\n");
    expect([...parseAddedLines(patch)].sort((a, b) => a - b)).toEqual([
      1, 2, 13,
    ]);
  });
});

describe("expandChangedLinesToBlocks", () => {
  const content = [
    "sp-gateway:", // 1
    "  routes:", // 2
    '  - id: "a"', // 3
    '    path: "/a/v1"', // 4
    "    versionStart: 0", // 5
    '  - id: "b"', // 6
    '    path: "/b/v1"', // 7
    "    versionStart: 0", // 8
  ].join("\n");

  test("widens a changed field line to its whole route block", async () => {
    const { expandChangedLinesToBlocks } = await import("../diff.js");
    // Only route a's versionStart (line 5) changed; expect the whole a block.
    const result = expandChangedLinesToBlocks(content, new Set([5]));
    expect([...result].sort((a, b) => a - b)).toEqual([3, 4, 5]);
    expect(result.has(6)).toBe(false);
  });

  test("returns the input unchanged when nothing changed", async () => {
    const { expandChangedLinesToBlocks } = await import("../diff.js");
    const result = expandChangedLinesToBlocks(content, new Set());
    expect(result.size).toBe(0);
  });
});

describe("filterGatewayToChangedLines", () => {
  const gateway = "/repo/api-route-specs/sp-gateway-routes.yaml";
  const other = "/repo/api-specs/v2024/paths/account.yaml";
  const issue = (source: string, line: number, severity = 0) => ({
    source,
    severity,
    range: { start: { line, character: 0 }, end: { line, character: 0 } },
  });

  const build = () => ({
    filteredPbs: {
      "gateway-rule": [issue(gateway, 9), issue(gateway, 99)],
      "spec-rule": [issue(other, 4, 1)],
    },
    severitiesCount: { 0: 2, 1: 1, 2: 0, 3: 0 },
  });

  test("keeps gateway findings on changed lines and all other files", async () => {
    const { filterGatewayToChangedLines } = await import("../spectral.js");
    // Line index 9 -> displayed line 10 is changed; index 99 -> line 100 is not.
    const changed = new Map([
      ["api-route-specs/sp-gateway-routes.yaml", new Set([10])],
    ]);
    const result = filterGatewayToChangedLines(build() as any, changed as any);
    expect(result.filteredPbs["gateway-rule"]).toHaveLength(1);
    expect(result.filteredPbs["gateway-rule"][0].range.start.line).toBe(9);
    expect(result.filteredPbs["spec-rule"]).toHaveLength(1);
    expect(result.severitiesCount[0]).toBe(1);
    expect(result.severitiesCount[1]).toBe(1);
  });

  test("drops all gateway findings when the file was not changed", async () => {
    const { filterGatewayToChangedLines } = await import("../spectral.js");
    const result = filterGatewayToChangedLines(build() as any, new Map() as any);
    expect(result.filteredPbs["gateway-rule"]).toBeUndefined();
    expect(result.filteredPbs["spec-rule"]).toHaveLength(1);
    expect(result.severitiesCount[0]).toBe(0);
  });

  test("keeps all gateway findings when the patch is unavailable (null)", async () => {
    const { filterGatewayToChangedLines } = await import("../spectral.js");
    const changed = new Map([
      ["api-route-specs/sp-gateway-routes.yaml", null],
    ]);
    const result = filterGatewayToChangedLines(build() as any, changed as any);
    expect(result.filteredPbs["gateway-rule"]).toHaveLength(2);
    expect(result.severitiesCount[0]).toBe(2);
  });
});
