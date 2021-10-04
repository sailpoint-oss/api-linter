var assert = require("assert");
let pathQueryParameterCheck = require("../path-query-parameter-check");
let ruleNumber = 157;
let requiredField = "fields";

let jsonParametersWithFieldsField = {
  operationId: "listAccounts",
  tags: ["Accounts"],
  summary: "Accounts List This is a test",
  description:
    "This returns a list of accounts.  \nA token with ORG_ADMIN authority is required to call this API.",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
  parameters: [
    {
      in: "query",
      name: requiredField,
    },
    {
      in: "query",
      name: "numberTest",
      example: 10,
      schema: {
        type: "number",
        format: "double",
      },
    },
    {
      in: "query",
      name: "filters",
      schema: {
        type: "string",
      },
      description:
        "Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/docs/standard_collection_parameters.html)\n\nFiltering is supported for the following fields and operators:\n\n**id**: *eq, in*\n\n**identityId**: *eq*\n\n**name**: *eq, in*\n\n**nativeIdentity**: *eq, in*\n\n**sourceId**: *eq, in*\n\n**uncorrelated**: *eq*",
    },
  ],
};

let jsonParametersWithoutRequiredField = {
  operationId: "listAccounts",
  tags: ["Accounts"],
  summary: "Accounts List This is a test",
  description:
    "This returns a list of accounts.  \nA token with ORG_ADMIN authority is required to call this API.",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
  parameters: [
    {
      in: "query",
      name: "numberTest",
      example: 10,
      schema: {
        type: "number",
        format: "double",
      },
    },
    {
      in: "query",
      name: "filters",
      schema: {
        type: "string",
      },
      description:
        "Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/docs/standard_collection_parameters.html)\n\nFiltering is supported for the following fields and operators:\n\n**id**: *eq, in*\n\n**identityId**: *eq*\n\n**name**: *eq, in*\n\n**nativeIdentity**: *eq, in*\n\n**sourceId**: *eq, in*\n\n**uncorrelated**: *eq*",
    },
  ],
};


let jsonParametersEmpty = {
  operationId: "listAccounts",
  tags: ["Accounts"],
  summary: "Accounts List This is a test",
  description:
    "This returns a list of accounts.  \nA token with ORG_ADMIN authority is required to call this API.",
  security: [
    {
      bearerAuth: ["idn:account-list:read"],
    },
  ],
};

describe("Path Query Parameter Check", function () {
  it("Should not return any error message if the field exits in query parameters", function () {
    assert.deepEqual(
      undefined,
      pathQueryParameterCheck(jsonParametersWithFieldsField, {
        rule: ruleNumber,
        field: requiredField,
      })
    );
  });

  it("Should not return any error message if the field exits in query parameters", function () {
    assert.deepEqual(
      [
        {
          message:
            `Rule ${ruleNumber}: All GET operations should have ${requiredField} as a query parameter`,
        },
      ],
      pathQueryParameterCheck(jsonParametersWithoutRequiredField, {
        rule: ruleNumber,
        field: requiredField,
      })
    );
  });

  it("Should return error message when the parameters object is missing or empty", function () {
    assert.deepEqual(
      [
        {
          message:
            `Rule ${ruleNumber}: All GET operations should have ${requiredField} as a query parameter`,
        },
      ],
      pathQueryParameterCheck(jsonParametersEmpty, {
        rule: ruleNumber,
        field: requiredField,
      })
    );
  });
});
