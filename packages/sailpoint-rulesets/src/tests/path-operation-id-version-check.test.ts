import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pathOperationIdVersionCheck from "../path-operation-id-version-check.js";

// Both src/tests/ and functions/tests/ are two levels deep from the package
// root, so this resolves correctly whether running as TypeScript or compiled JS.
const FIXTURE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
  "src/tests/fixtures",
);

// Simulates a path file at apis/transforms/paths/transforms-v1.yaml.
// The function reads ../openapi.yaml (fixtures/apis/transforms/openapi.yaml)
// which declares version: v1.
const TRANSFORMS_V1_SOURCE = path.join(
  FIXTURE_ROOT,
  "apis/transforms/paths/transforms-v1.yaml",
);

// Simulates a file outside apis/ — rule should be a no-op for these.
const VERSIONED_SOURCE = "/workspace/api-specs/idn/v3/paths/transforms.yaml";

const ruleNumber = "407";

function makeContext(source: string | undefined) {
  return { document: { source } } as any;
}

function makePathItem(methods: Record<string, { operationId?: string }>) {
  return methods as any;
}

describe("path-operation-id-version-check — apis/ collections", () => {
  it("passes when all operationIds end with the correct version suffix", () => {
    const result = pathOperationIdVersionCheck(
      makePathItem({
        get: { operationId: "listTransformsV1" },
        post: { operationId: "createTransformV1" },
      }),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_V1_SOURCE),
    );
    expect(result).toEqual([]);
  });

  it("errors when an operationId is missing the version suffix", () => {
    const result = pathOperationIdVersionCheck(
      makePathItem({
        get: { operationId: "listTransforms" },
      }),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_V1_SOURCE),
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: operationId "listTransforms" must end with the collection version suffix "V1".`,
        path: ["get", "operationId"],
      },
    ]);
  });

  it("errors when an operationId has a wrong version suffix", () => {
    const result = pathOperationIdVersionCheck(
      makePathItem({
        put: { operationId: "updateTransformV2" },
      }),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_V1_SOURCE),
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: operationId "updateTransformV2" must end with the collection version suffix "V1".`,
        path: ["put", "operationId"],
      },
    ]);
  });

  it("errors when operationId is absent entirely", () => {
    const result = pathOperationIdVersionCheck(
      makePathItem({
        delete: {},
      }),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_V1_SOURCE),
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: operationId is missing. It must be provided and end with the collection version suffix "V1" (e.g. listTransformsV1).`,
        path: ["delete", "operationId"],
      },
    ]);
  });

  it("reports errors for each failing method independently", () => {
    const result = pathOperationIdVersionCheck(
      makePathItem({
        get: { operationId: "listTransformsV1" },
        post: { operationId: "createTransform" },
        delete: { operationId: "removeTransform" },
      }),
      { rule: ruleNumber },
      makeContext(TRANSFORMS_V1_SOURCE),
    );
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      message: `Rule ${ruleNumber}: operationId "createTransform" must end with the collection version suffix "V1".`,
      path: ["post", "operationId"],
    });
    expect(result).toContainEqual({
      message: `Rule ${ruleNumber}: operationId "removeTransform" must end with the collection version suffix "V1".`,
      path: ["delete", "operationId"],
    });
  });
});

describe("path-operation-id-version-check — non-apis/ paths (no-op)", () => {
  it("does nothing for versioned path files outside apis/", () => {
    const result = pathOperationIdVersionCheck(
      makePathItem({
        get: { operationId: "listTransforms" },
      }),
      { rule: ruleNumber },
      makeContext(VERSIONED_SOURCE),
    );
    expect(result).toEqual([]);
  });

  it("does nothing when source is undefined", () => {
    const result = pathOperationIdVersionCheck(
      makePathItem({
        get: { operationId: "listTransforms" },
      }),
      { rule: ruleNumber },
      makeContext(undefined),
    );
    expect(result).toEqual([]);
  });
});
