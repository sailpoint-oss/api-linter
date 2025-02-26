import { describe, it, test, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import parameterOperationIdCheck from "../path-parameter-resource-id-check.js";
const ruleNumber = "404";

process.env.VALID_OPERATION_IDS =
  '["listAccounts","listEntitlements","listAccessProfiles"]';

const jsonParameterWithValidOperationId: OpenAPIV3.ParameterObject = {
  in: "path",
  name: "id",
  example: "1234",
  schema: {
    type: "string",
  },
  // @ts-expect-error OpenAPI Extenstions are valid
  "x-sailpoint-resource-operation-id": "listAccounts",
};

const jsonParameterWithNoOperationId: OpenAPIV3.ParameterObject = {
  in: "path",
  name: "id",
  example: "1234",
  schema: {
    type: "string",
  },
};

const jsonParameterWithInvalidOperationId: OpenAPIV3.ParameterObject = {
  in: "path",
  name: "id",
  example: "1234",
  schema: {
    type: "string",
  },
  // @ts-expect-error OpenAPI Extenstions are valid
  "x-sailpoint-resource-operation-id": "getAccounts",
};

const jsonParameterWithValidOperationIds: OpenAPIV3.ParameterObject = {
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
};

describe("Path Parameter Operation Id Check Test", function () {
  it("should not return any error messages if path parameter has a valid operation id defined under x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(
      jsonParameterWithValidOperationId,
      { rule: ruleNumber },
    );
    expect(result).to.be.an("array").that.is.empty;
  });

  it("should return an error message if path parameter is missing x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(jsonParameterWithNoOperationId, {
      rule: ruleNumber,
    });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: x-sailpoint-resource-operation-id is required for the path parameter: \{${jsonParameterWithNoOperationId.name}\}. Please provide an operation ID for where the resource ID can be found`,
      },
    ]);
  });

  test("should return an error message if path parameter has an invalid operation id", () => {
    const result = parameterOperationIdCheck(
      jsonParameterWithInvalidOperationId,
      {
        rule: ruleNumber,
      },
    );
    expect(result).toEqual([
      {
        // @ts-expect-error OpenAPI Extenstions are valid
        message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidOperationId["x-sailpoint-resource-operation-id"]} is invalid, the operationId must match an existing operationId in the API specs.`,
      },
    ]);
  });

  it("should not return an error message if path parameter has valid operation ids defined under x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(
      jsonParameterWithValidOperationIds,
      {
        rule: ruleNumber,
      },
    );
    expect(result).to.deep.equal([]);
  });
});
