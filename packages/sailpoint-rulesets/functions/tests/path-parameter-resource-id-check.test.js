import { expect } from "chai";
import parameterOperationIdCheck from "../path-parameter-resource-id-check.js";
const ruleNumber = 404;

process.env.VALID_OPERATION_IDS = '["listAccounts","listEntitlements","listAccessProfiles"]';

const jsonParameterWithNoParameters = {
  operationId: "getAccount",
  tags: ["Accounts"],
  summary: "Get an Account",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
  parameters: [
    {
      in: "path",
      name: "id",
      example: "1234",
      schema: {
        type: "string",
      },
      "x-sailpoint-resource-operation-id": "listAccounts",
    }
  ],
};

const jsonParameterWithValidOperationId = {
  operationId: "getAccount",
  tags: ["Accounts"],
  summary: "Get an Account",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
  parameters: [
    {
      in: "path",
      name: "id",
      example: "1234",
      schema: {
        type: "string",
      },
      "x-sailpoint-resource-operation-id": "listAccounts",
    }
  ],
};

const jsonParameterWithNoOperationId = {
  operationId: "getAccount",
  tags: ["Accounts"],
  summary: "Get an Account",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
  parameters: [
    {
      in: "path",
      name: "id",
      example: "1234",
      schema: {
        type: "string",
      }
    }
  ],
};

const jsonParameterWithIdentitcalOperationId = {
  operationId: "getAccount",
  tags: ["Accounts"],
  summary: "Get an Account",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
  parameters: [
    {
      in: "path",
      name: "id",
      example: "1234",
      schema: {
        type: "string",
      },
      "x-sailpoint-resource-operation-id": "getAccount",
    }
  ],
};

const jsonParameterWithInvalidOperationId = {
  operationId: "getAccount",
  tags: ["Accounts"],
  summary: "Get an Account",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
  parameters: [
    {
      in: "path",
      name: "id",
      example: "1234",
      schema: {
        type: "string",
      },
      "x-sailpoint-resource-operation-id": "listRecords",
    }
  ],
};

const jsonParameterWithValidOperationIds = {
    operationId: "getAccount",
    tags: ["Accounts"],
    summary: "Get an Account",
    security: [
      {
        bearerAuth: ["idn:account-list:read"],
      },
    ],
    parameters: [
      {
        in: "path",
        name: "id",
        example: "1234",
        schema: {
          type: "string",
        },
        "x-sailpoint-resource-operation-id": ["listEntitlements", "listAccessProfiles"]
      }
    ],
  };

describe("Path Parameter Operation Id Check Test", function () {
  it("should not return any error messages if no path parameters exist", function () {
    const result = parameterOperationIdCheck(
      jsonParameterWithNoParameters,
      { rule: ruleNumber }
    );
    expect(result).to.be.an("array").that.is.empty;
  });

  it("should not return any error messages if path parameter has a valid operation id defined under x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(
      jsonParameterWithValidOperationId,
      { rule: ruleNumber }
    );
    expect(result).to.be.an("array").that.is.empty;
  });

  it("should return an error message if path parameter is missing x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(jsonParameterWithNoOperationId, {
      rule: ruleNumber,
    });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: x-sailpoint-resource-operation-id is required for the path parameter: \{${jsonParameterWithNoOperationId.parameters[0].name}\}. Please provide an operation ID for where the resource ID can be found. For example, if the path parameter is an accountId, the x-sailpoint-resource-operation-id should be listAccounts.`,
      },
    ]);
  });

  it("should return an error message if x-sailpoint-resource-operation-id is the same value as the operationId for the method", function () {
    const result = parameterOperationIdCheck(jsonParameterWithIdentitcalOperationId, {
      rule: ruleNumber,
    });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: ${jsonParameterWithIdentitcalOperationId.parameters[0]["x-sailpoint-resource-operation-id"]} is invalid. The x-sailpoint-resource-operation-id cannot reference itself, please provide an operation Id for where ${jsonParameterWithIdentitcalOperationId.parameters[0].name} can be found in the response.`,
      },
    ]);
  });



  it("should return an error message if path parameter is missing a valid operation id defined under x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(jsonParameterWithInvalidOperationId, {
      rule: ruleNumber,
    });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidOperationId.parameters[0]["x-sailpoint-resource-operation-id"]} is invalid, the operationId must match an existing operationId in the API specs.`,
      },
    ]);
  });

  it("should not return an error message if path parameter has valid operation ids defined under x-sailpoint-resource-operation-id", function () {
    const result = parameterOperationIdCheck(jsonParameterWithValidOperationIds, {
      rule: ruleNumber,
    });
    expect(result).to.deep.equal([]);
  });
});
