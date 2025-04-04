// path-summary-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#402"
// given: $[*]
// severity: warn
// then:
//   function: tag-check
//   functionOptions:
//     rule: 402

import { IRuleResult } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";

export default (
  targetVal: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  options: { rule: string },
  context: any,
) => {
  const { rule } = options;
  let results: IRuleResult[] = [];
  let tagArray: string[] = [];

  if (
    context.document.source === undefined ||
    context.document.source === null
  ) {
    console.error("No source file found.");
  } else {
    if (context.document.source.includes("v3")) {
      const preloadedTags = process.env.V3_TAGS_JSON;
      if (preloadedTags) {
        tagArray = JSON.parse(preloadedTags);
      } else {
        console.error(
          "Preloaded V3 tags data not found in environment, this will not run the tags check.",
        );
      }
    } else if (context.document.source.includes("v2024")) {
      const preloadedTags = process.env.V2024_TAGS_JSON;
      if (preloadedTags) {
        tagArray = JSON.parse(preloadedTags);
      } else {
        console.error(
          "Preloaded V2024 tags data not found in environment, this will not run the tags check.",
        );
      }
    } else if (context.document.source.includes("v2025")) {
      const preloadedTags = process.env.V2025_TAGS_JSON;
      if (preloadedTags) {
        tagArray = JSON.parse(preloadedTags);
      } else {
        console.error(
          "Preloaded V2025 tags data not found in environment, this will not run the tags check.",
        );
      }
    } else if (context.document.source.includes("beta")) {
      const preloadedTags = process.env.BETA_TAGS_JSON;
      if (preloadedTags) {
        tagArray = JSON.parse(preloadedTags);
      } else {
        console.error(
          "Preloaded Beta tags data not found in environment, this will not run the tags check.",
        );
      }
    }
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
