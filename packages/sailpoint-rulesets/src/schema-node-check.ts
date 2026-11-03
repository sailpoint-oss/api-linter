// Checks one schema node for rules that need more than one key of the node.
// The JSONPath selector does the recursion, so this function looks only at
// the node that it gets. A JSONPath filter cannot match the root node, so
// these rules also select "$" and this function checks the root itself.
//
// schema-booleans-must-not-be-nullable:
//   resolved: false
//   given:
//     - "$"
//     - "$..[?(@ && typeof @.type === 'string' && !@path.match(/\\b(example|examples|default)\\b/))]"
//   then:
//     function: schema-node-check
//     functionOptions:
//       check: boolean
//       rule: 122
//
// The "check" option selects what to check:
//   boolean - a boolean is not nullable (rule 122)
//   array   - an array is not nullable and has no null default (rule 124)
//   null    - a null example, default or enum value needs nullable: true (rule 318)
//   map     - a map that uses additionalProperties has no properties (rule 216)

import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

type SchemaNode = {
  type?: unknown;
  nullable?: unknown;
  example?: unknown;
  default?: unknown;
  enum?: unknown;
  additionalProperties?: unknown;
  properties?: unknown;
};

function checkBoolean(node: SchemaNode) {
  if (node.type === "boolean" && node.nullable === true) {
    return [{ message: "A boolean must not be nullable. If null has a meaning, use an enum of named values instead", path: ["nullable"] }];
  }
  return [];
}

function checkArray(node: SchemaNode) {
  if (node.type !== "array") return [];
  const results = [];
  if (node.nullable === true) {
    results.push({ message: "An array must not be nullable. Use an empty array instead of null", path: ["nullable"] });
  }
  if ("default" in node && node.default === null) {
    results.push({ message: "An array must not have a null default. Use an empty array instead", path: ["default"] });
  }
  return results;
}

function checkNull(node: SchemaNode) {
  if (node.nullable === true) return [];
  const results = [];
  for (const field of ["example", "default"] as const) {
    if (field in node && node[field] === null) {
      results.push({ message: `The ${field} is null, so the schema must set nullable: true`, path: [field] });
    }
  }
  if (Array.isArray(node.enum) && node.enum.includes(null)) {
    results.push({ message: "The enum has a null value, so the schema must set nullable: true", path: ["enum"] });
  }
  return results;
}

function checkMap(node: SchemaNode) {
  if (typeof node.additionalProperties === "object" && node.additionalProperties !== null && node.properties) {
    return [{ message: "A map that uses additionalProperties should not also define properties", path: ["properties"] }];
  }
  return [];
}

const CHECKS: Record<string, (node: SchemaNode) => { message: string; path: string[] }[]> = {
  boolean: checkBoolean,
  array: checkArray,
  null: checkNull,
  map: checkMap,
};

export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        check: { enum: Object.keys(CHECKS) },
        rule: true,
      },
      required: ["check", "rule"],
    },
  },
  (targetVal: SchemaNode, options: { check: string; rule: string }, context) => {
    const { check, rule } = options;
    if (targetVal === null || typeof targetVal !== "object" || Array.isArray(targetVal)) return;
    // The root of a schema file is also passed in, so make sure that it is a schema.
    if (typeof targetVal.type !== "string") return;

    const basePath = context?.path ?? [];
    return CHECKS[check](targetVal).map(({ message, path }) => ({
      message: `Rule ${rule}: ${message}`,
      path: [...basePath, ...path],
    }));
  },
);
