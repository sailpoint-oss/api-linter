import { expect } from "chai";
import responseValidator from "../response-validator.js";

const ruleNumber = 151;

const jsonResponseWithAllResponsesDefined = {
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

const jsonWithMissingErrorResponses = {
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

const jsonWithMissing2xxLevelResponseAndMissingErrorResponse = {
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

const jsonWith2xxLevelResponseMissing = {
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
    expect(responseValidator(jsonResponseWithAllResponsesDefined, { rule: ruleNumber })).to.be.undefined;
  });

  it("Should return error message when error responses missing from the provided json", function () {
    expect(responseValidator(jsonWithMissingErrorResponses, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Operation must have the following error codes defined: 429,500`,
      },
    ]);
  });

  it("Should return error message about 200 level response missing and missing error codes when missing from the provided json", function () {
    expect(responseValidator(jsonWithMissing2xxLevelResponseAndMissingErrorResponse, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Operation must have at least one 200 level response code defined and the following error codes defined: 500`,
      },
    ]);
  });

  it("Should return error message about 200 level response missing from the provided json", function () {
    expect(responseValidator(jsonWith2xxLevelResponseMissing, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Operation must have at least one 200 level response code defined`,
      },
    ]);
  });
});
