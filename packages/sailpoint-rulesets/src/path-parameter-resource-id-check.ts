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
    let results = [];
    let operationIdArray = [];

    // If enum is not present, we need to know where to get an ID from for the resource
    // @ts-expect-error OpenAPI Extenstions are valid
    if (targetVal["x-sailpoint-resource-operation-id"] === undefined) {
      if (
        targetVal.schema &&
        // @ts-expect-error This doesnt run on reference objects
        targetVal.schema.type === "string" &&
        // @ts-expect-error This doesnt run on reference objects
        targetVal.schema.enum === undefined
      ) {
        results.push({
          message: `Rule ${rule}: x-sailpoint-resource-operation-id is required for the path parameter: {${targetVal.name}}. Please provide an operation ID for where the resource ID can be found`,
        });
      }
    } else {
      const rawString = process.env.VALID_OPERATION_IDS;

      if (rawString) {
        operationIdArray = JSON.parse(rawString);
      } else {
        console.error(
          "Preloaded OperationIds data not found in environment, this will not run the valid operation id check.",
        );
      }

      if (operationIdArray.length !== 0) {
        if (
          !operationIdArray.includes(
            // @ts-expect-error OpenAPI Extensions are valid
            targetVal["x-sailpoint-resource-operation-id"],
          )
        ) {
          results.push({
            // @ts-expect-error OpenAPI Extenstions are valid
            message: `Rule ${rule}: ${targetVal["x-sailpoint-resource-operation-id"]} is invalid, the operationId must match an existing operationId in the API specs.`,
          });
        }
      }
    }

    return results;
  },
);
