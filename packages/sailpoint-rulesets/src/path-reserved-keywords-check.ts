import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

// Create the original function using Spectral's helper.
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
  (targetVal: OpenAPIV3.ParameterObject, options: { rule: string }) => {
    const reservedKeywords = [
      "type",
      "format",
      "description",
      "items",
      "properties",
      "additionalProperties",
      "default",
      "allOf",
      "oneOf",
      "anyOf",
      "not",
    ];

    const { rule } = options;

    if (
      targetVal.name != undefined &&
      reservedKeywords.includes(targetVal.name)
    ) {
      return [
        {
          message: `Rule ${rule}: The property ${targetVal.name} is a reserved keyword of OpenAPI Specifications. Please use a different name`,
        },
      ];
    }
  },
);
