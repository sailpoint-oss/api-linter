import fs from "node:fs";
import path from "node:path";
import { RulesetFunctionContext } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";
import yaml from "js-yaml";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];

/**
 * Reads the collection's openapi.yaml, finds the URL path entry that $refs
 * this specific file, and extracts the version segment (e.g. "v1" from
 * "/access-model-metadata/v1/attributes").
 *
 * Returns null if the file isn't found in the paths or has no version segment.
 */
function getVersionForFile(source: string): string | null {
  try {
    const openapiPath = path.resolve(path.dirname(source), "..", "openapi.yaml");
    const spec = yaml.load(fs.readFileSync(openapiPath, "utf8")) as any;

    if (!spec?.paths) return null;

    const filename = path.basename(source);

    for (const [urlPath, pathItem] of Object.entries(spec.paths)) {
      const ref = (pathItem as any)?.$ref;
      if (!ref) continue;

      if (path.basename(ref) === filename) {
        // Extract the version segment, e.g. /access-model-metadata/v1/attributes → "v1"
        // Allow version at end of path (/transforms/v1) or mid-path (/transforms/v1/{id})
        const match = urlPath.match(/\/(v\d+)(\/|$)/);
        return match ? match[1] : null;
      }
    }
  } catch {
    // openapi.yaml missing or unreadable — skip silently
  }
  return null;
}

/** Converts "v1" → "V1", "v2" → "V2", etc. */
function versionToSuffix(version: string): string {
  return version.charAt(0).toUpperCase() + version.slice(1);
}

export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
      },
      required: ["rule"],
    },
  },
  (
    targetVal: OpenAPIV3.PathItemObject,
    options: { rule: string },
    context: RulesetFunctionContext,
  ) => {
    const { rule } = options;
    const source: string | undefined = context?.document?.source ?? undefined;

    if (!source?.includes("/apis/")) {
      return [];
    }

    const version = getVersionForFile(source);
    if (!version) {
      console.error(
        `Could not determine version from URL path in collection openapi.yaml for ${source}, skipping operation ID version check.`,
      );
      return [];
    }

    const expectedSuffix = versionToSuffix(version);
    const results: { message: string; path: (string | number)[] }[] = [];

    for (const method of HTTP_METHODS) {
      const operation = (targetVal as any)[method] as OpenAPIV3.OperationObject | undefined;
      if (!operation) continue;

      if (!operation.operationId) {
        results.push({
          message: `Rule ${rule}: operationId is missing. It must be provided and end with the collection version suffix "${expectedSuffix}" (e.g. listTransforms${expectedSuffix}).`,
          path: [method, "operationId"],
        });
      } else if (!operation.operationId.endsWith(expectedSuffix)) {
        results.push({
          message: `Rule ${rule}: operationId "${operation.operationId}" must end with the collection version suffix "${expectedSuffix}".`,
          path: [method, "operationId"],
        });
      }
    }

    return results;
  },
);
