var assert = require("assert");
let deprecation = require("../deprecation.js");

let path = {
  target: ["get"],
};

let jsonWithDeprecationNotSet = {
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
      $ref: "../parameters/limit.yaml",
    },
    {
      $ref: "../parameters/offset.yaml",
    },
    {
      $ref: "../parameters/count.yaml",
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
  responses: {
    200: {
      description: "List of account objects",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              $ref: "../schemas/Account.yaml",
            },
          },
        },
      },
    },
    400: {
      $ref: "../responses/400.yaml",
    },
    401: {
      $ref: "../responses/401.yaml",
    },
    403: {
      $ref: "../responses/403.yaml",
    },
    429: {
      $ref: "../responses/429.yaml",
    },
  },
};

let jsonWithDeprecationSetMissingRequiredParameters = {
  deprecated: true,
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
      $ref: "../parameters/limit.yaml",
    },
    {
      $ref: "../parameters/offset.yaml",
    },
    {
      $ref: "../parameters/count.yaml",
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
  responses: {
    200: {
      description: "List of account objects",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              $ref: "../schemas/Account.yaml",
            },
          },
        },
      },
    },
    400: {
      $ref: "../responses/400.yaml",
    },
    401: {
      $ref: "../responses/401.yaml",
    },
    403: {
      $ref: "../responses/403.yaml",
    },
    429: {
      $ref: "../responses/429.yaml",
    },
  },
};

let jsonWithDeprecationSetMissingSunsetRequiredParameter = {
  deprecated: true,
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
      $ref: "../parameters/limit.yaml",
    },
    {
      $ref: "../parameters/offset.yaml",
    },
    {
      $ref: "../parameters/count.yaml",
    },
    {
      in: "header",
      name: "deprecation",
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
  responses: {
    200: {
      description: "List of account objects",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              $ref: "../schemas/Account.yaml",
            },
          },
        },
      },
    },
    400: {
      $ref: "../responses/400.yaml",
    },
    401: {
      $ref: "../responses/401.yaml",
    },
    403: {
      $ref: "../responses/403.yaml",
    },
    429: {
      $ref: "../responses/429.yaml",
    },
  },
};

let jsonWithDeprecationSetMissingDeprecationRequiredParameter = {
    deprecated: true,
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
        $ref: "../parameters/limit.yaml",
      },
      {
        $ref: "../parameters/offset.yaml",
      },
      {
        $ref: "../parameters/count.yaml",
      },
      {
        in: "header",
        name: "sunset",
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
    responses: {
      200: {
        description: "List of account objects",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "../schemas/Account.yaml",
              },
            },
          },
        },
      },
      400: {
        $ref: "../responses/400.yaml",
      },
      401: {
        $ref: "../responses/401.yaml",
      },
      403: {
        $ref: "../responses/403.yaml",
      },
      429: {
        $ref: "../responses/429.yaml",
      },
    },
  };

let jsonWithDeprecationSetWithRequiredParameters = {
    deprecated: true,
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
        $ref: "../parameters/limit.yaml",
      },
      {
        $ref: "../parameters/offset.yaml",
      },
      {
        $ref: "../parameters/count.yaml",
      },
      {
        in: "header",
        name: "sunset",
      },
      {
        in: "header",
        name: "deprecation",
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
    responses: {
      200: {
        description: "List of account objects",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "../schemas/Account.yaml",
              },
            },
          },
        },
      },
      400: {
        $ref: "../responses/400.yaml",
      },
      401: {
        $ref: "../responses/401.yaml",
      },
      403: {
        $ref: "../responses/403.yaml",
      },
      429: {
        $ref: "../responses/429.yaml",
      },
    },
  };

describe("Deprecation Tests", function () {
  it("Should not return any error messages when depcreation flag is not set", function () {
    assert.deepEqual([], deprecation(jsonWithDeprecationNotSet, path));
  });

  it("Should return error message when depcreation flag is set but the headers (deprecation and sunset) are not defined", function () {
    assert.deepEqual(
      [
        {
          message:
            "The path get must define deprecation and sunset dates in the header if api is marked as deprecated",
          path: ["get", "deprecated"],
        },
      ],
      deprecation(jsonWithDeprecationSetMissingRequiredParameters, path)
    );
  });

  it("Should return error message when deprecation flag is set but the header (sunset) not defined", function () {
    assert.deepEqual(
      [
        {
          message:
            "The path get must define sunset date in the header if api is marked as deprecated",
          path: ["get", "deprecated"],
        },
      ],
      deprecation(jsonWithDeprecationSetMissingSunsetRequiredParameter, path)
    );
  });


  it("Should return error message when deprecation flag is set but the header (depcreation) not defined", function () {
    assert.deepEqual(
      [
        {
          message:
            "The path get must define deprecation date in the header if api is marked as deprecated",
          path: ["get", "deprecated"],
        },
      ],
      deprecation(jsonWithDeprecationSetMissingDeprecationRequiredParameter, path)
    );
  });

  it("Should not return any errors when json is valid and the rule is followed", function () {
    assert.deepEqual(
      [],
      deprecation(jsonWithDeprecationSetWithRequiredParameters, path)
    );
  });
});
