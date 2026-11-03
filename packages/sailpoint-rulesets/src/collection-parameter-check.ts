// Checks the types of the standard collection query parameters.
//
// path-collection-parameters-must-have-standard-types:
//   given: $[get,put,post,patch,delete,head,options].parameters[?(@ && @.in === 'query')]
//   then:
//     function: collection-parameter-check
//     functionOptions:
//       rule: 137

import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

const STANDARD_TYPES: Record<string, string> = {
  limit: "integer",
  offset: "integer",
  count: "boolean",
  filters: "string",
  sorters: "string",
};

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
  (targetVal: OpenAPIV3.ParameterObject, options: { rule: string }, context) => {
    const { rule } = options;
    if (!targetVal || typeof targetVal !== "object") return;

    const expected = STANDARD_TYPES[targetVal.name];
    if (!expected) return;

    const schema = targetVal.schema as OpenAPIV3.SchemaObject | undefined;
    if (schema?.type === expected) return;

    return [
      {
        message: `Rule ${rule}: The ${targetVal.name} query parameter must be of type ${expected}, but it is ${schema?.type ?? "not defined"}`,
        path: [...(context?.path ?? []), "schema"],
      },
    ];
  },
);
