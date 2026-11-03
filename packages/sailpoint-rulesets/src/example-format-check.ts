// Checks that an example matches the type and the format of its schema.
//
// schema-examples-must-match-type-and-format:
//   resolved: false
//   given:
//     - "$"
//     - "$..[?(@ && typeof @.type === 'string' && !@path.match(/\\b(example|examples|default)\\b/))]"
//   then:
//     function: example-format-check
//     functionOptions:
//       rule: 304
//
// The function also takes a parameter object. Then it reads the type and the
// format from the parameter schema, and the example from the parameter or
// from its schema.

import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

const FORMATS: Record<string, { pattern: RegExp; hint: string }> = {
  uuid: {
    pattern: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    hint: "a UUID, for example 2c9180a4-6b4e-4a2c-9f3e-8d7c6b5a4f3e",
  },
  "date-time": {
    pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
    hint: "an RFC 3339 date-time, for example 2024-05-28T14:07:17Z",
  },
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    hint: "an RFC 3339 full-date, for example 2024-05-28",
  },
  email: {
    pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    hint: "an email address, for example jane.doe@example.com",
  },
  uri: {
    pattern: /^[a-zA-Z][a-zA-Z0-9+.-]*:\S+$/,
    hint: "an absolute URI, for example https://example.com/resource",
  },
};

type Node = {
  type?: unknown;
  format?: unknown;
  example?: unknown;
  schema?: Node;
};

function typeProblem(type: unknown, example: unknown): string | undefined {
  switch (type) {
    case "string":
      return typeof example === "string" || example instanceof Date ? undefined : "a string";
    case "integer":
      return Number.isInteger(example) ? undefined : "an integer";
    case "number":
      return typeof example === "number" ? undefined : "a number";
    case "boolean":
      return typeof example === "boolean" ? undefined : "a boolean (true or false, not a quoted string)";
    default:
      return undefined;
  }
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
  (targetVal: Node, options: { rule: string }, context) => {
    const { rule } = options;
    if (targetVal === null || typeof targetVal !== "object" || Array.isArray(targetVal)) return;

    // A parameter keeps its type in the schema, and its example in either place.
    const isParameter = typeof targetVal.schema === "object" && targetVal.schema !== null && !("type" in targetVal);
    const schema = isParameter ? (targetVal.schema as Node) : targetVal;
    const examplePath = isParameter && !("example" in targetVal) ? ["schema", "example"] : ["example"];
    const example = isParameter && !("example" in targetVal) ? schema.example : targetVal.example;

    if (typeof schema.type !== "string" || example === undefined || example === null) return;

    const path = [...(context?.path ?? []), ...examplePath];
    const expectedType = typeProblem(schema.type, example);
    if (expectedType) {
      return [{ message: `Rule ${rule}: The example ${JSON.stringify(example)} must be ${expectedType}, because the type is ${schema.type}`, path }];
    }

    // YAML can read an unquoted date-time as a Date. That is a valid example.
    if (schema.type !== "string" || typeof schema.format !== "string" || typeof example !== "string") return;
    const format = FORMATS[schema.format];
    if (format && !format.pattern.test(example)) {
      return [{ message: `Rule ${rule}: The example "${example}" must be ${format.hint}, because the format is ${schema.format}`, path }];
    }
  },
);
