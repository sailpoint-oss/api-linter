import { describe, it, test, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import parameterOperationIdCheck from "../path-parameter-resource-id-check.js";
const ruleNumber = "404";

process.env.VERSIONED_OPERATION_IDS =
  '["listAccounts","listEntitlements","listAccessProfiles"]';
process.env.APIS_OPERATION_IDS =
  '["listAccounts","listEntitlements","listAccessProfiles"]';

// Simulated versioned source path so the checker picks up VERSIONED_OPERATION_IDS.
const versionedContext = {
  document: { source: "/workspace/api-specs/idn/v3/paths/access-profiles.yaml" },
} as any;

const jsonParameterWithValidOperationId: OpenAPIV3.OperationObject = {
  tags: ["Access Profiles"],
  summary: "List Access Profiles",
  operationId: "pathAccessProfiles",
  description:
    "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
  parameters: [{
    in: "path",
    name: "id",
    example: "1234",
    schema: {
      type: "string",
    },
    // @ts-expect-error OpenAPI Extenstions are valid
    "x-sailpoint-resource-operation-id": "listAccounts",
  }],
  responses: {
    200: {
      description: "List of Access Profiles",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
            },
          },
        },
      },
    },
  },
  security: [{ oauth2: ["idn:access-profile:read"] }],
}

const jsonParameterWithNoOperationId: OpenAPIV3.OperationObject = {
  tags: ["Access Profiles"],
  summary: "List Access Profiles",
  operationId: "pathAccessProfiles",
  description:
    "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
  parameters: [{
    in: "path",
    name: "id",
    example: "1234",
    schema: {
      type: "string",
    },
  }],
  responses: {
    200: {
      description: "List of Access Profiles",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
            },
          },
        },
      },
    },
  },
  security: [{ oauth2: ["idn:access-profile:read"] }],
}

const jsonParameterWithInvalidOperationId: OpenAPIV3.OperationObject = {
  tags: ["Access Profiles"],
  summary: "List Access Profiles",
  operationId: "pathAccessProfiles",
  description:
    "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
  parameters: [{
    in: "path",
    name: "id",
    example: "1234",
    schema: {
      type: "string",
    },
    // @ts-expect-error OpenAPI Extenstions are valid
    "x-sailpoint-resource-operation-id": "getAccounts",
  }],
  responses: {
    200: {
      description: "List of Access Profiles",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
            },
          },
        },
      },
    },
  },
  security: [{ oauth2: ["idn:access-profile:read"] }],
}

const jsonParameterWithInvalidOperationIdSelfRef: OpenAPIV3.OperationObject = {
  tags: ["Access Profiles"],
  summary: "List Access Profiles",
  operationId: "listAccessProfiles",
  description:
    "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
  parameters: [{
    in: "path",
    name: "id",
    example: "1234",
    schema: {
      type: "string",
    },
    // @ts-expect-error OpenAPI Extenstions are valid
    "x-sailpoint-resource-operation-id": "listAccessProfiles",
  }],
  responses: {
    200: {
      description: "List of Access Profiles",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
            },
          },
        },
      },
    },
  },
  security: [{ oauth2: ["idn:access-profile:read"] }],
}


const jsonParameterWithValidOperationIds: OpenAPIV3.OperationObject = {
  tags: ["Access Profiles"],
  summary: "List Access Profiles",
  operationId: "pathAccessProfiles",
  description:
    "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
  parameters: [{
    in: "path",
    name: "id",
    example: "1234",
    schema: {
      type: "string",
    },
    // @ts-expect-error OpenAPI Extenstions are valid
    "x-sailpoint-resource-operation-id": [
      "listEntitlements",
      "listAccessProfiles",
    ],  
  }],
  responses: {
    200: {
      description: "List of Access Profiles",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
            },
          },
        },
      },
    },
  },
  security: [{ oauth2: ["idn:access-profile:read"] }],
}

describe("Path Parameter Operation Id Check Test", function () {
  it("should not return any error messages if path parameter has a valid operation id defined under x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(
      jsonParameterWithValidOperationId,
      { rule: ruleNumber },
      versionedContext,
    );
    expect(result).to.be.an("array").that.is.empty;
  });

  it("should return an error message if path parameter is missing x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(jsonParameterWithNoOperationId, {
      rule: ruleNumber,
    }, versionedContext);
    expect(result).to.deep.equal([
      {
        // @ts-expect-error OpenAPI Extenstions are valid
        message: `Rule ${ruleNumber}: x-sailpoint-resource-operation-id is required for the path parameter: \{${jsonParameterWithNoOperationId.parameters[0].name}\}. Please provide an operation ID for where the resource ID can be found`,
      },
    ]);
  });

  test("should return an error message if path parameter has an invalid operation id", () => {
    const result = parameterOperationIdCheck(
      jsonParameterWithInvalidOperationId,
      { rule: ruleNumber },
      versionedContext,
    );
    expect(result).toEqual([
      {
        // @ts-expect-error OpenAPI Extenstions are valid
        message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidOperationId.parameters[0]["x-sailpoint-resource-operation-id"]} is invalid, the x-sailpoint-resource-operation-id must match an existing operationId in the API specs.`,
      },
    ]);
  });

  test("should return an error message if path parameter operation id references itself.", () => {
    const result = parameterOperationIdCheck(
      jsonParameterWithInvalidOperationIdSelfRef,
      { rule: ruleNumber },
      versionedContext,
    );
    expect(result).toEqual([
      {
        // @ts-expect-error OpenAPI Extenstions are valid
        message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidOperationIdSelfRef.parameters[0]["x-sailpoint-resource-operation-id"]} is invalid, the x-sailpoint-resource-operation-id must not reference itself.`,
      },
    ]);
  });

  it("should not return an error message if path parameter has valid operation ids defined under x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(
      jsonParameterWithValidOperationIds,
      { rule: ruleNumber },
      versionedContext,
    );
    expect(result).to.deep.equal([]);
  });
});
