// Checks that each field in the description of the filters query parameter uses
// the same format as the property in the 200 response (rule 324):
//   - A top-level property of the response uses camelCase (ex. ownerId).
//   - A property in a nested object uses dot notation (ex. owner.id).
//
// The check reports a field only when the response schema shows the correct
// format. A field that is not in the response schema is not reported, because
// some filters do not map to a response property.
//
// path-filter-fields-must-match-response-format:
//   given: $[*]
//   then:
//     function: parameter-filter-field-format-check
//     functionOptions:
//       rule: 324

import { RulesetFunctionContext } from "@stoplight/spectral-core";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

type Schema = Record<string, any>;

const MAX_DEPTH = 10;
const FIELD_LINE = /^\s*\*\*([^*]+)\*\*\s*:/gm;

// Returns the properties of a schema. Properties from allOf, oneOf and anyOf
// are merged, and the items of an array are used in place of the array.
function propertiesOf(schema: unknown, seen = new Set<unknown>(), depth = 0): Record<string, Schema> {
  const out: Record<string, Schema> = {};
  if (!schema || typeof schema !== "object" || seen.has(schema) || depth > MAX_DEPTH) return out;
  seen.add(schema);
  const s = schema as Schema;
  for (const key of ["allOf", "oneOf", "anyOf"]) {
    if (Array.isArray(s[key])) {
      for (const sub of s[key]) Object.assign(out, propertiesOf(sub, seen, depth + 1));
    }
  }
  if (s.items) Object.assign(out, propertiesOf(s.items, seen, depth + 1));
  if (s.properties && typeof s.properties === "object") Object.assign(out, s.properties);
  return out;
}

function resolves(schema: Schema, parts: string[]): boolean {
  let current: unknown = schema;
  for (const part of parts) {
    const props = propertiesOf(current);
    if (!(part in props)) return false;
    current = props[part];
  }
  return true;
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const snakeToCamel = (s: string) => s.replace(/_+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase());

// Finds a dot notation path for a camelCase name, for example ownerId -> owner.id.
function dotPathFor(schema: unknown, name: string, depth = 0): string | undefined {
  if (depth > MAX_DEPTH) return undefined;
  const props = propertiesOf(schema);
  for (let i = 1; i < name.length; i++) {
    if (!/[A-Z]/.test(name[i])) continue;
    const head = name.slice(0, i);
    const rest = lowerFirst(name.slice(i));
    if (!(head in props)) continue;
    const nested = propertiesOf(props[head]);
    if (rest in nested) return `${head}.${rest}`;
    const deeper = dotPathFor(props[head], rest, depth + 1);
    if (deeper) return `${head}.${deeper}`;
  }
  return undefined;
}

function successSchema(operation: Schema): Schema | undefined {
  const responses = operation.responses ?? {};
  const code = ["200", "2XX", "2xx"].find((c) => responses[c]) ?? Object.keys(responses).find((c) => /^2\d\d$/.test(c));
  const content = code ? responses[code]?.content : undefined;
  if (!content || typeof content !== "object") return undefined;
  const json = Object.entries(content).find(([mediaType]) => /^application\/(.+\+)?json\b/.test(mediaType));
  return (json?.[1] as Schema | undefined)?.schema;
}

function checkField(schema: Schema, field: string): string | undefined {
  const parts = field.split(".");
  if (resolves(schema, parts)) return undefined;

  // A snake_case field, for example start_time -> startTime or owner_id -> owner.id.
  if (field.includes("_")) {
    const camelParts = parts.map(snakeToCamel);
    if (resolves(schema, camelParts)) return camelParts.join(".");
    if (camelParts.length === 1) return dotPathFor(schema, camelParts[0]);
    return undefined;
  }

  // A camelCase field for a nested property, for example ownerId -> owner.id.
  if (parts.length === 1) return dotPathFor(schema, field);

  // A dot notation field for a top-level property, for example owner.id -> ownerId.
  const camel = parts[0] + parts.slice(1).map(upperFirst).join("");
  if (resolves(schema, [camel])) return camel;

  return undefined;
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
  (targetVal: Schema, options: { rule: string }, context?: RulesetFunctionContext) => {
    const { rule } = options;
    if (!targetVal || typeof targetVal !== "object" || Array.isArray(targetVal)) return [];
    if (!Array.isArray(targetVal.parameters)) return [];

    const index = targetVal.parameters.findIndex(
      (p: Schema) => p && p.in === "query" && p.name === "filters" && typeof p.description === "string",
    );
    if (index === -1) return [];

    const schema = successSchema(targetVal);
    if (!schema) return [];

    const results = [];
    const description: string = targetVal.parameters[index].description;
    for (const match of description.matchAll(FIELD_LINE)) {
      const field = match[1].trim();
      const suggestion = checkField(schema, field);
      if (!suggestion) continue;
      const format = suggestion.includes(".")
        ? "A property in a nested object of the response must use dot notation"
        : "A top-level property of the response must use camelCase";
      results.push({
        message: `Rule ${rule}: The filter field ${field} does not match the response. ${format}. Use **${suggestion}**`,
        path: [...(context?.path ?? []), "parameters", index, "description"],
      });
    }
    return results;
  },
);
