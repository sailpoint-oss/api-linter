// Checks one content map of a request body or a response.
//
// path-content-must-use-json-media-type:
//   given:
//     - $[get,put,post,patch,delete,head,options].requestBody.content
//     - $[get,put,post,patch,delete,head,options].responses.*.content
//   then:
//     function: media-type-check
//     functionOptions:
//       check: json
//       rule: 167
//
// The "check" option selects what to check:
//   json   - object and array payloads use application/json or a +json type (rule 167)
//   binary - a JSON payload does not use format: binary (rule 239)

import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

// Form and multipart payloads are objects, but they are not JSON. CSV is a
// standard data format that rule 168 allows.
const NON_JSON_OBJECT_TYPES = /^(multipart\/|application\/x-www-form-urlencoded$|text\/csv$)/;
const JSON_TYPE = /^application\/(.+\+)?json(-patch\+json)?$|^application\/[a-z.-]+\+json$/;

function asObject(value: unknown): Record<string, any> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, any>) : undefined;
}

function isStructured(schema: Record<string, any> | undefined) {
  return schema !== undefined && (schema.type === "object" || schema.type === "array" || "properties" in schema);
}

// Looks at the schema and its direct properties and items. Deeper levels are
// in other schema files, and the schema ruleset checks those.
function binaryFields(schema: Record<string, any> | undefined): string[] {
  if (!schema) return [];
  const found: string[] = [];
  if (schema.format === "binary") found.push("the schema");
  for (const [name, property] of Object.entries(asObject(schema.properties) ?? {})) {
    if (asObject(property)?.format === "binary") found.push(`the property ${name}`);
  }
  if (asObject(schema.items)?.format === "binary") found.push("the array items");
  return found;
}

export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        check: { enum: ["json", "binary"] },
        rule: true,
      },
      required: ["check", "rule"],
    },
  },
  (targetVal: Record<string, unknown>, options: { check: string; rule: string }, context) => {
    const { check, rule } = options;
    const content = asObject(targetVal);
    if (!content) return;

    const basePath = context?.path ?? [];
    const results = [];
    for (const [mediaType, media] of Object.entries(content)) {
      const schema = asObject(asObject(media)?.schema);
      const isJson = JSON_TYPE.test(mediaType);

      if (check === "json" && !isJson && !NON_JSON_OBJECT_TYPES.test(mediaType) && isStructured(schema) && binaryFields(schema).length === 0) {
        results.push({
          message: `Rule ${rule}: The ${mediaType} payload is an object or an array, so it must use application/json or a +json media type`,
          path: [...basePath, mediaType],
        });
      }

      if (check === "binary" && isJson) {
        for (const field of binaryFields(schema)) {
          results.push({
            message: `Rule ${rule}: In the ${mediaType} payload, ${field} uses format: binary. Encode binary data in JSON with format: byte (base64)`,
            path: [...basePath, mediaType, "schema"],
          });
        }
      }
    }
    return results;
  },
);
