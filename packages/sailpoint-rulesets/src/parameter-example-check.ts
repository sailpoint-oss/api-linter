import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { OpenAPIV3 } from "openapi-types";

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
  (
    targetVal: OpenAPIV3.ParameterObject,
    options: { rule: string },
    context,
  ) => {
    const { rule } = options;
    if (
      (targetVal.example != undefined && targetVal.example != null) ||
      (targetVal.schema &&
        "example" in targetVal.schema &&
        targetVal.schema.example != null) ||
      (targetVal.examples != undefined && targetVal.examples != null)
    ) {
      return undefined;
    } else {
      return [
        {
          message: `Rule ${rule}: An example for ${targetVal.name} must be provided under one of the following keys: example, schema.example, examples`,
        },
      ];
    }
  },
);
