import pathQueryParameterCheck from "../path-query-parameter-check.js";

const ruleNumber = 157;
const requiredField = "fields";

const jsonParametersWithFieldsField = {
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

const jsonParametersWithoutRequiredField = {
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

const jsonParametersEmpty = {
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

describe("Path Query Parameter Check", () => {
  test("Should not return any error message if the field exists in query parameters", () => {
    const result = pathQueryParameterCheck(jsonParametersWithFieldsField, {
      rule: ruleNumber,
      field: requiredField,
    });
    expect(result).toBeUndefined();
  });

  test("Should return an error message if the required field is missing from query parameters", () => {
    const result = pathQueryParameterCheck(jsonParametersWithoutRequiredField, {
      rule: ruleNumber,
      field: requiredField,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: All GET operations should have ${requiredField} as a query parameter`,
      },
    ]);
  });

  test("Should return an error message when the parameters object is missing or empty", () => {
    const result = pathQueryParameterCheck(jsonParametersEmpty, {
      rule: ruleNumber,
      field: requiredField,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: All GET operations should have ${requiredField} as a query parameter`,
      },
    ]);
  });
});
