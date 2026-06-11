// path-summary-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#402"
// given: $[*]
// severity: warn
// then:
//   function: tag-check
//   functionOptions:
//     rule: 402

import fs from "node:fs";
import path from "node:path";
import { IRuleResult } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";
import yaml from "js-yaml";

// Match version as a path segment (/v3/, /v2024/, etc.) to avoid false
// positives on versioned filenames like transforms-v3.yaml inside apis/.
function hasVersionSegment(source: string, version: string): boolean {
  return source.includes(`/${version}/`);
}

function getTagsForVersionedSource(source: string): string[] {
  const versionEnvMap: Array<[string, string]> = [
    ["v3", "V3_TAGS_JSON"],
    ["v2024", "V2024_TAGS_JSON"],
    ["v2025", "V2025_TAGS_JSON"],
    ["v2026", "V2026_TAGS_JSON"],
    ["beta", "BETA_TAGS_JSON"],
  ];

  for (const [version, envKey] of versionEnvMap) {
    if (hasVersionSegment(source, version)) {
      const raw = process.env[envKey];
      if (raw) {
        return JSON.parse(raw);
      }
      console.error(
        `${envKey} not found in environment, this will not run the tags check.`,
      );
      return [];
    }
  }

  return [];
}

function getTagsForApisSource(source: string): string[] {
  try {
    const openapiPath = path.resolve(path.dirname(source), "..", "openapi.yaml");
    const spec = yaml.load(fs.readFileSync(openapiPath, "utf8")) as any;
    if (spec?.tags?.[0]?.name) {
      return [spec.tags[0].name];
    }
    console.error(
      `No tags found in ${openapiPath}, this will not run the tags check.`,
    );
  } catch {
    console.error(
      `Could not read collection openapi.yaml for ${source}, this will not run the tags check.`,
    );
  }
  return [];
}

export default (
  targetVal: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  options: { rule: string },
  context: any,
) => {
  const { rule } = options;
  let results: IRuleResult[] = [];
  let tagArray: string[] = [];

  const source: string | undefined = context?.document?.source;

  if (!source) {
    console.error("No source file found.");
  } else if (source.includes("/apis/")) {
    tagArray = getTagsForApisSource(source);
  } else {
    tagArray = getTagsForVersionedSource(source);
  }

  for (const [key, value] of Object.entries(targetVal)) {
    if (value.tags === undefined || value.tags == null) {
      // @ts-ignore
      results.push({
        message: `Rule ${rule}: You must include one tag to group an endpoint under`,
        path: [key, "tags"],
      });
    } else if (value.tags.length > 1) {
      // @ts-ignore
      results.push({
        message: `Rule ${rule}: You must include only one tag to group an endpoint under`,
        path: [key, "tags"],
      });
    }

    if (tagArray.length > 0 && value.tags != undefined) {
      value.tags.forEach((tag: string) => {
        if (!tagArray.includes(tag)) {
          // @ts-ignore
          results.push({
            message: `Rule ${rule}: Tag "${tag}" is not defined in the root API spec`,
            path: [key, "tags"],
          });
        }
      });
    }
  }

  return results;
};
