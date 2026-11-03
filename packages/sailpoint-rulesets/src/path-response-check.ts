// Checks the responses of each operation in a path file.
//
// path-create-operations-must-return-201:
//   given: $
//   then:
//     function: path-response-check
//     functionOptions:
//       check: create-201
//       rule: 150
//
// The "check" option selects what to check:
//   standard-codes  - each code is a standard code that the method can return (rule 150)
//   create-201      - a create POST returns 201 (rule 150)
//   async-202       - an async operation returns 202 (rule 150)
//   location-201    - a 201 response defines a location header (rule 150)
//   not-found-404   - PUT, PATCH and DELETE on a single resource define 404 (rule 148)
//   bulk-207        - a bulk or batch POST returns 207 (rule 152)
//   rate-limit-429  - a 429 response defines rate limit headers (rule 153)
//   error-schema    - error responses use the ErrorResponseDto shape (rule 326).
//                     The API gateway, not the service, returns the 401 and
//                     429 bodies, so those codes are not checked.
//
// The function gets the whole path item, because a path parameter can be
// defined for all operations at the path level.

import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

type Result = { message: string; path: (string | number)[] };
type Operation = OpenAPIV3.OperationObject;
type Response = OpenAPIV3.ResponseObject;

const METHODS = ["get", "put", "post", "patch", "delete", "head", "options"];
const ALL = METHODS;
const CHANGES = ["post", "put", "patch", "delete"];

// The standard codes from rule 150, and the methods that can return them.
const STANDARD_CODES: Record<string, string[]> = {
  "200": ALL,
  "201": ["post", "put"],
  "202": CHANGES,
  // Rule 148 allows 204 for POST "exceptionally".
  "204": CHANGES,
  "207": ["post", "delete"],
  "301": ALL,
  "303": CHANGES,
  "304": ["get", "head"],
  "400": ALL,
  "401": ALL,
  "403": ALL,
  "404": ALL,
  "405": ALL,
  "406": ALL,
  "408": ALL,
  "409": CHANGES,
  "410": ALL,
  "412": ["put", "patch", "delete"],
  "415": CHANGES,
  "423": ["put", "patch", "delete"],
  "428": ALL,
  "429": ALL,
  "500": ALL,
  "501": ALL,
  "503": ALL,
  default: ALL,
};

const GATEWAY_CODES = ["401", "429"];

const ERROR_FIELDS: Record<string, string> = {
  detailCode: "string",
  trackingId: "string",
  messages: "array",
  causes: "array",
};

function asObject(value: unknown): Record<string, any> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, any>) : undefined;
}

function hasHeader(response: Response | undefined, name: string) {
  const headers = asObject(response?.headers) ?? {};
  return Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());
}

function hasPathParameter(pathItem: OpenAPIV3.PathItemObject, operation: Operation) {
  const parameters = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])];
  return parameters.some((parameter) => asObject(parameter)?.in === "path");
}

function checkOperation(check: string, pathItem: OpenAPIV3.PathItemObject, method: string, operation: Operation): Result[] {
  const responses = asObject(operation.responses) ?? {};
  const codes = Object.keys(responses);
  const operationId = typeof operation.operationId === "string" ? operation.operationId : "";
  const at = (...path: (string | number)[]) => [method, ...path];
  const name = operationId || method.toUpperCase();

  switch (check) {
    case "standard-codes":
      return codes.flatMap((code) => {
        const methods = STANDARD_CODES[code];
        if (!methods) {
          return [{ message: `${name} uses ${code}, which is not a standard status code`, path: at("responses", code) }];
        }
        if (!methods.includes(method)) {
          return [{ message: `${name} uses ${code}, which a ${method.toUpperCase()} operation must not return`, path: at("responses", code) }];
        }
        return [];
      });

    case "create-201":
      if (method !== "post" || !/^create/.test(operationId) || /Async/.test(operationId)) return [];
      if (codes.includes("201")) return [];
      return [{ message: `${name} creates a resource, so it must return 201 Created`, path: at("responses") }];

    case "async-202":
      if (!/Async/.test(operationId) || codes.includes("202")) return [];
      return [{ message: `${name} is asynchronous, so it must return 202 Accepted`, path: at("responses") }];

    case "location-201": {
      const created = asObject(responses["201"]) as Response | undefined;
      if (!created || hasHeader(created, "location")) return [];
      return [{ message: `The 201 response of ${name} must define the location header`, path: at("responses", "201") }];
    }

    case "not-found-404":
      if (!["put", "patch", "delete"].includes(method) || !hasPathParameter(pathItem, operation)) return [];
      if (codes.includes("404")) return [];
      return [{ message: `${name} works on a single resource, so it must define a 404 response`, path: at("responses") }];

    case "bulk-207":
      if (method !== "post" || !/bulk|batch/i.test(operationId) || codes.includes("207")) return [];
      return [{ message: `${name} is a bulk or batch operation, so it must return 207 Multi-Status`, path: at("responses") }];

    case "rate-limit-429": {
      const tooMany = asObject(responses["429"]) as Response | undefined;
      if (!tooMany) return [];
      const rateLimit = ["x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset"].every((header) => hasHeader(tooMany, header));
      if (hasHeader(tooMany, "retry-after") || rateLimit) return [];
      return [{ message: `The 429 response of ${name} must define the retry-after header, or the x-ratelimit-limit, x-ratelimit-remaining and x-ratelimit-reset headers`, path: at("responses", "429") }];
    }

    case "error-schema":
      return codes
        .filter((code) => (/^[45]\d\d$/.test(code) || code === "default") && !GATEWAY_CODES.includes(code))
        .flatMap((code) => {
          const schema = asObject(asObject(asObject(asObject(responses[code])?.content)?.["application/json"])?.schema);
          if (!schema) return [];
          const properties = asObject(schema.properties) ?? {};
          const missing = Object.entries(ERROR_FIELDS)
            .filter(([field, type]) => asObject(properties[field])?.type !== type)
            .map(([field, type]) => `${field} (${type})`);
          if (missing.length === 0) return [];
          return [{ message: `The ${code} response of ${name} must use the ErrorResponseDto shape. It is missing ${missing.join(", ")}`, path: at("responses", code) }];
        });

    default:
      return [];
  }
}

const CHECKS = ["standard-codes", "create-201", "async-202", "location-201", "not-found-404", "bulk-207", "rate-limit-429", "error-schema"];

export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        check: { enum: CHECKS },
        rule: true,
      },
      required: ["check", "rule"],
    },
  },
  (targetVal: OpenAPIV3.PathItemObject, options: { check: string; rule: string }) => {
    const { check, rule } = options;
    const pathItem = asObject(targetVal) as OpenAPIV3.PathItemObject | undefined;
    if (!pathItem) return;

    return METHODS.flatMap((method) => {
      const operation = asObject((pathItem as Record<string, unknown>)[method]) as Operation | undefined;
      if (!operation) return [];
      return checkOperation(check, pathItem, method, operation);
    }).map(({ message, path }) => ({ message: `Rule ${rule}: ${message}`, path }));
  },
);
