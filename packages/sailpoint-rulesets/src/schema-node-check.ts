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
//   map      - a map that uses additionalProperties has no properties (rule 216)
//   required - a required list is not null or empty (rule 317)
//   defaults - each optional property defines a default (rule 316). For a
//              query parameter, an optional parameter defines a default.
//
// The "requestBodyOnly" option checks only the schema files that a request
// body uses. See request-body-schemas.ts.

import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { isRequestBodySchema } from "./request-body-schemas.js";

type SchemaNode = {
  type?: unknown;
  nullable?: unknown;
  example?: unknown;
  default?: unknown;
  enum?: unknown;
  additionalProperties?: unknown;
  properties?: unknown;
  required?: unknown;
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

// A missing required list is allowed: it means that all properties are optional.
function checkRequired(node: SchemaNode) {
  if (!("required" in node)) return [];
  if (node.required === null || (Array.isArray(node.required) && node.required.length === 0)) {
    return [{ message: "If a required key is defined for a schema object, it must not be null or empty", path: ["required"] }];
  }
  return [];
}

// Booleans are checked by rule 310. A $ref property gets its default from the
// referenced schema.
function checkDefaults(node: SchemaNode) {
  if (!node.properties || typeof node.properties !== "object") return [];
  const required = Array.isArray(node.required) ? node.required : [];
  const results = [];
  for (const [name, property] of Object.entries(node.properties as Record<string, any>)) {
    if (required.includes(name) || !property || typeof property !== "object") continue;
    if ("$ref" in property || property.type === "boolean" || "default" in property) continue;
    results.push({
      message: `The optional property ${name} must define a default value, because the schema is used in a request body. Add a default, or add ${name} to the required list`,
      path: ["properties", name],
    });
  }
  return results;
}

type Parameter = { in?: unknown; name?: unknown; required?: unknown; schema?: Record<string, unknown> };

// Query parameters that need no default. If the client sends no filters, the
// API applies no filter and returns all results.
const NO_DEFAULT_QUERY_PARAMETERS = new Set(["filters"]);

// An optional query parameter defines the default in its schema. A $ref
// schema gets its default from the referenced schema.
function checkQueryParameterDefault(parameter: Parameter) {
  if (parameter.in !== "query" || parameter.required === true) return [];
  if (typeof parameter.name === "string" && NO_DEFAULT_QUERY_PARAMETERS.has(parameter.name)) return [];
  const schema = parameter.schema;
  if (!schema || typeof schema !== "object" || "$ref" in schema || "default" in schema) return [];
  return [
    {
      message: `The optional query parameter ${String(parameter.name)} must define a default value in its schema, or set required: true`,
      path: ["schema"],
    },
  ];
}

const CHECKS: Record<string, (node: SchemaNode) => { message: string; path: string[] }[]> = {
  boolean: checkBoolean,
  array: checkArray,
  null: checkNull,
  map: checkMap,
  required: checkRequired,
  defaults: checkDefaults,
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
        requestBodyOnly: { type: "boolean" },
      },
      required: ["check", "rule"],
    },
  },
  (targetVal: SchemaNode, options: { check: string; rule: string; requestBodyOnly?: boolean }, context) => {
    const { check, rule, requestBodyOnly } = options;
    if (targetVal === null || typeof targetVal !== "object" || Array.isArray(targetVal)) return;
    if (requestBodyOnly && !isRequestBodySchema(context?.document?.source)) return;

    const basePath = context?.path ?? [];
    // A parameter object is not a schema, so it has its own check.
    const isParameter = check === "defaults" && typeof (targetVal as Parameter).in === "string";
    // The root of a schema file is also passed in, so make sure that it is a schema.
    if (!isParameter && typeof targetVal.type !== "string") return;

    const problems = isParameter ? checkQueryParameterDefault(targetVal as Parameter) : CHECKS[check](targetVal);
    return problems.map(({ message, path }) => ({
      message: `Rule ${rule}: ${message}`,
      path: [...basePath, ...path],
    }));
  },
);
