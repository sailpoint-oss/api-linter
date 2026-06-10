import { describe, it, beforeEach, afterEach, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tagCheck from "../tag-check.js";

// Both src/tests/ and functions/tests/ are two levels deep from the package
// root, so this resolves correctly whether running as TypeScript or compiled JS.
const FIXTURE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
  "src/tests/fixtures",
);

// Absolute path to a hypothetical path file inside the transforms fixture collection.
// tag-check reads ../openapi.yaml relative to this file's directory.
const TRANSFORMS_PATH_SOURCE = path.join(
  FIXTURE_ROOT,
  "apis/transforms/paths/transforms-v1.yaml",
);

// Simulate a versioned path file source (/v3/ as a directory segment).
const V3_PATH_SOURCE = "/home/runner/work/api-specs/idn/v3/paths/access-profiles.yaml";

// A versioned filename inside apis/ that must NOT trigger the v3 version branch.
const APIS_V3_FILENAME_SOURCE = path.join(
  FIXTURE_ROOT,
  "apis/transforms/paths/transforms-v3.yaml",
);

const ruleNumber = "402";

function makeContext(source: string | undefined) {
  return { document: { source } };
}

function makeTargetVal(tags: string[] | undefined) {
  return {
    get: {
      operationId: "listTransforms",
      tags,
      summary: "List transforms",
    },
  } as any;
}

// ---------------------------------------------------------------------------
// Versioned path tests
// ---------------------------------------------------------------------------
describe("tag-check — versioned paths (/v3/, /v2024/, etc.)", () => {
  beforeEach(() => {
    process.env.V3_TAGS_JSON = '["Transforms","Access Profiles","Accounts"]';
  });

  afterEach(() => {
    delete process.env.V3_TAGS_JSON;
  });

  it("passes when the tag is defined in V3_TAGS_JSON", () => {
    const result = tagCheck(
      makeTargetVal(["Transforms"]),
      { rule: ruleNumber },
      makeContext(V3_PATH_SOURCE),
    );
    expect(result).toEqual([]);
  });

  it("errors when the tag is not in V3_TAGS_JSON", () => {
    const result = tagCheck(
      makeTargetVal(["Unknown Tag"]),
      { rule: ruleNumber },
      makeContext(V3_PATH_SOURCE),
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Tag "Unknown Tag" is not defined in the root API spec`,
        path: ["get", "tags"],
      },
    ]);
  });

  it("does NOT match /v3/ for a versioned filename inside apis/ (e.g. transforms-v3.yaml)", () => {
    // The source path contains 'v3' in the filename but not as a directory segment.
    // It should fall through to the apis/ branch and read the fixture openapi.yaml.
    const result = tagCheck(
      makeTargetVal(["Transforms"]),
      { rule: ruleNumber },
      makeContext(APIS_V3_FILENAME_SOURCE),
    );
    // Should pass: "Transforms" is the correct tag for the transforms collection.
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// apis/ collection tests
// ---------------------------------------------------------------------------
describe("tag-check — apis/ collections (reads sibling openapi.yaml)", () => {
  it("passes when the tag matches the collection openapi.yaml", () => {
    const result = tagCheck(
      makeTargetVal(["Transforms"]),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_PATH_SOURCE),
    );
    expect(result).toEqual([]);
  });

  it("errors when the tag does not match the collection openapi.yaml", () => {
    const result = tagCheck(
      makeTargetVal(["Access Profiles"]),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_PATH_SOURCE),
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Tag "Access Profiles" is not defined in the root API spec`,
        path: ["get", "tags"],
      },
    ]);
  });

  it("errors when no tag is provided", () => {
    const result = tagCheck(
      makeTargetVal(undefined),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_PATH_SOURCE),
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: You must include one tag to group an endpoint under`,
        path: ["get", "tags"],
      },
    ]);
  });

  it("errors when more than one tag is provided", () => {
    const result = tagCheck(
      makeTargetVal(["Transforms", "Access Profiles"]),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_PATH_SOURCE),
    );
    expect(result).toContainEqual({
      message: `Rule ${ruleNumber}: You must include only one tag to group an endpoint under`,
      path: ["get", "tags"],
    });
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("tag-check — edge cases", () => {
  it("skips tag validation gracefully when source is undefined", () => {
    const result = tagCheck(
      makeTargetVal(["Transforms"]),
      { rule: ruleNumber },
      makeContext(undefined),
    );
    // No tag validation — only structural checks apply (one tag present, so no error)
    expect(result).toEqual([]);
  });
});
