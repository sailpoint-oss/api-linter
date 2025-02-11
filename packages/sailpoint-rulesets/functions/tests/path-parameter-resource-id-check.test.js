import parameterOperationIdCheck from "../path-parameter-resource-id-check.js";
const ruleNumber = 404;

process.env.VALID_OPERATION_IDS = '["listAccounts"]';

const jsonParameterWithValidOperationId = {
  in: "path",
  name: "id",
  example: "1234",
  schema: {
    type: "string",
  },
  "x-sailpoint-resource-operation-id": "listAccounts",
};

const jsonParameterWithNoOperationId = {
  in: "path",
  name: "id",
  example: "1234",
  schema: {
    type: "string",
  },
};

const jsonParameterWithInvalidOperationId = {
    in: "path",
    name: "id",
    example: "1234",
    schema: {
      type: "string",
    },
    "x-sailpoint-resource-operation-id": "getAccounts",
  };

describe("Path Parameter Operation Id Check Test", () => {
  test("should not return any error messages if path parameter has a valid operation id defined under x-sailpoint-resource-operation-id", () => {
    const result = parameterOperationIdCheck(
      jsonParameterWithValidOperationId,
      { rule: ruleNumber }
    );
    expect(result).toEqual([]);
  });

  test("should return an error message if path parameter is missing x-sailpoint-resource-operation-id", () => {
    const result = parameterOperationIdCheck(jsonParameterWithNoOperationId, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: x-sailpoint-resource-operation-id is required for the path parameter: {${jsonParameterWithNoOperationId.name}}. Please provide an operation ID for where the resource ID can be found`,
      },
    ]);
  });

  test("should return an error message if path parameter has an invalid operation id", () => {
    const result = parameterOperationIdCheck(jsonParameterWithInvalidOperationId, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidOperationId["x-sailpoint-resource-operation-id"]} is invalid, the operationId must match an existing operationId in the API specs.`,
      },
    ]);
  });
});
