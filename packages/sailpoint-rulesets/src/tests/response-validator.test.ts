import { describe, test, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import responseValidator from "../response-validator.js";

const ruleNumber = "151";

const jsonResponseWithAllResponsesDefined: OpenAPIV3.ResponsesObject = {
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

const jsonWithMissingErrorResponses: OpenAPIV3.ResponsesObject = {
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

const jsonWithMissing2xxLevelResponseAndMissingErrorResponse: OpenAPIV3.ResponsesObject =
  {
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

const jsonWith2xxLevelResponseMissing: OpenAPIV3.ResponsesObject = {
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

describe("Response Validator", () => {
  test("Should not return any error messages when all responses defined in the provided json", () => {
    expect(
      responseValidator(jsonResponseWithAllResponsesDefined, {
        rule: ruleNumber,
      }),
    ).toBeUndefined();
  });

  test("Should return error message when error responses missing from the provided json", () => {
    expect(
      responseValidator(jsonWithMissingErrorResponses, { rule: ruleNumber }),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Operation must have the following error codes defined: 429,500`,
      },
    ]);
  });

  test("Should return error message about 200 level response missing and missing error codes", () => {
    expect(
      responseValidator(
        jsonWithMissing2xxLevelResponseAndMissingErrorResponse,
        { rule: ruleNumber },
      ),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Operation must have at least one 200 level response code defined and the following error codes defined: 500`,
      },
    ]);
  });

  test("Should return error message about 200 level response missing", () => {
    expect(
      responseValidator(jsonWith2xxLevelResponseMissing, { rule: ruleNumber }),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Operation must have at least one 200 level response code defined`,
      },
    ]);
  });
});
