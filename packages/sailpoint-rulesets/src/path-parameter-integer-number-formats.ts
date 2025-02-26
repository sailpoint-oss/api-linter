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
    const { rule } = options;
    if (
      "schema" in targetVal &&
      targetVal.schema != undefined &&
      "type" in targetVal.schema &&
      targetVal.schema.type != undefined &&
      targetVal.schema.type != null
    ) {
      if (targetVal.schema.type == "integer") {
        if (targetVal.schema.format == undefined) {
          return [
            {
              message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: int32, int64, bigint`,
            },
          ];
        } else if (
          !["int32", "int64", "bigint"].includes(targetVal.schema.format)
        ) {
          return [
            {
              message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: int32, int64, bigint`,
            },
          ];
        }
      } else if (targetVal.schema.type == "number") {
        if (targetVal.schema.format == undefined) {
          return [
            {
              message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: float, double, decimal`,
            },
          ];
        } else if (
          !["float", "double", "decimal"].includes(targetVal.schema.format)
        ) {
          return [
            {
              message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: float, double, decimal`,
            },
          ];
        }
      }
    }
  },
);
