import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

type OperationObject = OpenAPIV3.OperationObject;
type ResponseObject = OpenAPIV3.ResponseObject;

function isOperationObject(value: unknown): value is OperationObject {
  return typeof value === "object" && value !== null && "operationId" in value;
}

function isResponseObject(value: unknown): value is ResponseObject {
  return typeof value === "object" && value !== null && "content" in value;
}

function hasArrayResponse(operation: OperationObject): boolean {
  const response = operation.responses?.["200"];
  if (!response || !isResponseObject(response)) return false;

  const schema = response.content?.["application/json"]?.schema;
  if (!schema || typeof schema !== "object" || !("type" in schema))
    return false;
  return schema.type === "array";
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
  (targetVal: OpenAPIV3.PathItemObject, options: { rule: string }) => {
    const { rule } = options;
    const results = [];

    const allowedOperationsForGetArrayMethods = [
      "compare",
      "export",
      "get",
      "list",
      "search",
    ];
    const allowedOperationsForGetMethods = ["get", "search", "test"];

    const allowedOperationsForPostMethods = [
      "approve",
      "cancel",
      "complete",
      "create",
      "delete",
      "disable",
      "enable",
      "export",
      "hide",
      "import",
      "move",
      "ping",
      "reject",
      "reset",
      "search",
      "send",
      "set",
      "show",
      "start",
      "submit",
      "sync",
      "test",
      "unlock",
      "unregister",
      "update",
      "load",
      "reload",
      "process",
      "publish",
    ];

    const allowedOperationsForPutMethods = ["put", "set", "overwrite"];

    const allowedOperationsForPatchMethods = ["patch", "update"];

    const allowedOperationsForDeleteMethods = ["delete", "remove"];

    for (const [key, value] of Object.entries(targetVal)) {
      if (!isOperationObject(value)) continue;

      if (!value.operationId) {
        results.push({
          message: `Rule ${rule}: a camelCased operationId must be provided`,
          path: [key, "operationId"],
        });
        continue;
      }

      const matchArray = value.operationId.match(/([A-Z]?[^A-Z]*)/g);
      if (!matchArray?.[0]) continue;

      const descriptor = matchArray[0];

      if (key === "get" && hasArrayResponse(value)) {
        if (!allowedOperationsForGetArrayMethods.includes(descriptor)) {
          results.push({
            message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForGetArrayMethods}] for get endpoints that return an array of results`,
            path: [key, "operationId"],
          });
        }
      } else if (key === "get") {
        if (!allowedOperationsForGetMethods.includes(descriptor)) {
          results.push({
            message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForGetMethods}] for get endpoints that return a single result`,
            path: [key, "operationId"],
          });
        }
      } else if (key === "post") {
        if (!allowedOperationsForPostMethods.includes(descriptor)) {
          results.push({
            message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForPostMethods}] for post endpoints`,
            path: [key, "operationId"],
          });
        }
      } else if (key === "put") {
        if (!allowedOperationsForPutMethods.includes(descriptor)) {
          results.push({
            message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForPutMethods}] for put endpoints`,
            path: [key, "operationId"],
          });
        }
      } else if (key === "patch") {
        if (!allowedOperationsForPatchMethods.includes(descriptor)) {
          results.push({
            message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForPatchMethods}] for patch endpoints`,
            path: [key, "operationId"],
          });
        }
      } else if (key === "delete") {
        if (!allowedOperationsForDeleteMethods.includes(descriptor)) {
          results.push({
            message: `Rule ${rule}: ${descriptor} is invalid, the operationId must start with one of the allowed values [${allowedOperationsForDeleteMethods}] for delete endpoints`,
            path: [key, "operationId"],
          });
        }
      }
    }

    return results;
  },
);
