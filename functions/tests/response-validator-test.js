var assert = require("assert");
let responseValidator = require("../response-validator.js");

let jsonResponseWithAllResponsesDefined = {
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
  500: {
    $ref: "../responses/500.yaml",
  },
};

let jsonWithMissingErrorResponses = {
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
};

let jsonWithMissing2xxLevelResponseAndMissingErrorResponse = {
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
};

let jsonWith2xxLevelResponseMissing = {
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
  500: {
    $ref: "../responses/500.yaml",
  },
};

describe("Response Validator", function () {
  it("Should not return any error messages when all responses defined in the provided json", function () {
    assert.equal(
      undefined,
      responseValidator(jsonResponseWithAllResponsesDefined)
    );
  });

  it("Should return error message when error responses missing from the provided json", function () {
    assert.deepEqual(
      [
        {
          message:
            "Operation must have the following error codes defined: 429,500",
        },
      ],
      responseValidator(jsonWithMissingErrorResponses)
    );
  });

  it("Should return error message about 200 level response missing and missing error codes when missing from the provided json", function () {
    assert.deepEqual(
      [
        {
          message:
            "Operation must have at least one 200 level response code defined and the following error codes defined: 500",
        },
      ],
      responseValidator(jsonWithMissing2xxLevelResponseAndMissingErrorResponse)
    );
  });

  it("Should return error message about 200 level response missing from the provided json", function () {
    assert.deepEqual(
      [
        {
          message:
            "Operation must have at least one 200 level response code defined",
        },
      ],
      responseValidator(jsonWith2xxLevelResponseMissing)
    );
  });
});
