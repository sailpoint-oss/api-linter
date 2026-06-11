import { RulesetFunctionContext } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

const VERSION_SEGMENTS = ["v3", "beta", "v2024", "v2025", "v2026"];

function resolveOperationIdArray(source: string | undefined): string[] {
  if (!source) {
    console.error(
      "No source file found, this will not run the valid operation id check.",
    );
    return [];
  }

  const isVersioned = VERSION_SEGMENTS.some((v) => source.includes(`/${v}/`));
  const isApis = source.includes("/apis/");

  let envVar: string | undefined;
  if (isVersioned) {
    envVar = process.env.VERSIONED_OPERATION_IDS;
    if (!envVar) {
      console.error(
        "VERSIONED_OPERATION_IDS not found in environment, this will not run the valid operation id check.",
      );
    }
  } else if (isApis) {
    envVar = process.env.APIS_OPERATION_IDS;
    if (!envVar) {
      console.error(
        "APIS_OPERATION_IDS not found in environment, this will not run the valid operation id check.",
      );
    }
  } else {
    // Fallback for files that don't match either pattern (e.g. test files)
    envVar = process.env.VERSIONED_OPERATION_IDS ?? process.env.APIS_OPERATION_IDS;
    if (!envVar) {
      console.error(
        "No operation ID environment variable found, this will not run the valid operation id check.",
      );
    }
  }

  return envVar ? JSON.parse(envVar) : [];
}

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
    targetVal: OpenAPIV3.OperationObject,
    options: { rule: string },
    context: RulesetFunctionContext,
  ) => {
    const { rule } = options;
    let results: { message: string }[] = [];

    if (targetVal.parameters !== undefined) {
      const operationIdArray = resolveOperationIdArray(
        context?.document?.source ?? undefined,
      );

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
