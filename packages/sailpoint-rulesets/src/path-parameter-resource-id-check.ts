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
  (targetVal: OpenAPIV3.OperationObject, options: { rule: string }) => {
    const { rule } = options;
    let results: { message: string }[] = [];
    let operationIdArray: string[] = [];
    
    if (targetVal.parameters !== undefined) {
      const rawString = process.env.VALID_OPERATION_IDS;

      if (rawString) {
        operationIdArray = JSON.parse(rawString);
      } else {
        console.error(
          "Preloaded OperationIds data not found in environment, this will not run the valid operation id check.",
        );
      }

      targetVal.parameters.forEach((parameter) => {
        // @ts-expect-error OpenAPI Extenstions are valid
        if (parameter.in === "path") {
          // @ts-expect-error OpenAPI Extenstions are valid
            if (parameter["x-sailpoint-resource-operation-id"] === undefined) {
              // @ts-expect-error OpenAPI Extenstions are valid
              if(parameter.schema != undefined && parameter.schema.type === "string" && parameter.schema.enum === undefined) {
                results.push({
                  message: `Rule ${rule}: x-sailpoint-resource-operation-id is required for the path parameter: {id}. Please provide an operation ID for where the resource ID can be found`,
                });
              }
          } else {
            // @ts-expect-error OpenAPI Extensions are valid
            const operationIds = Array.isArray(parameter["x-sailpoint-resource-operation-id"]) ? parameter["x-sailpoint-resource-operation-id"] : [parameter["x-sailpoint-resource-operation-id"]];

            operationIds.forEach((operationId) => {
              if (operationIdArray.length !== 0) {
                if (!operationIdArray.includes(operationId)) {
                  results.push({
                    message: `Rule ${rule}: ${operationId} is invalid, the x-sailpoint-resource-operation-id must match an existing operationId in the API specs.`,
                  });
                }
              }
          
              if (operationId === targetVal.operationId) {
                results.push({
                  message: `Rule ${rule}: ${operationId} is invalid, the x-sailpoint-resource-operation-id must not reference itself.`,
                });
              }
            });

          }
        }
      });
    }
    
    return results;
  },
);
