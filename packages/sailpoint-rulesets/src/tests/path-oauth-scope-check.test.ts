import { describe, test, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import pathOauthScopeCheck from "../path-oauth-scope-check.js";

const ruleNumber = "104";

const jsonNoAuthExplicit: OpenAPIV3.OperationObject = {
  security: [{}],
  responses: {},
};

const jsonNoAuthImplicit: OpenAPIV3.OperationObject = {
  security: [],
  responses: {},
};

const jsonApplicationAuthNoUserLevels: OpenAPIV3.OperationObject = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
  ],
  responses: {},
};

const jsonApplicationAndUserAuthNoUserLevels: OpenAPIV3.OperationObject = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  responses: {},
};

const jsonInvalidKey: OpenAPIV3.OperationObject = {
  security: [
    {
      userAuthentication: ["idn:account-list:read"],
    },
  ],
  responses: {},
};

describe("Path Oauth Scope Check", () => {
  test("Should not return any error message when security array contains an explicit empty object", () => {
    expect(
      pathOauthScopeCheck(jsonNoAuthExplicit, { rule: ruleNumber }),
    ).toEqual([]);
  });

  test("Should not return any error message when security array contains one valid key", function () {
    expect(
      pathOauthScopeCheck(jsonApplicationAuthNoUserLevels, {
        rule: ruleNumber,
      }),
    ).toEqual([]);
  });

  test("Should not return any error message when security array contains two valid keys", function () {
    expect(
      pathOauthScopeCheck(jsonApplicationAndUserAuthNoUserLevels, {
        rule: ruleNumber,
      }),
    ).toEqual([]);
  });

  test("Should return an error message if security array is empty", function () {
    expect(
      pathOauthScopeCheck(jsonNoAuthImplicit, { rule: ruleNumber }),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Operations must define the security array with one or more of the following values: userAuth, applicationAuth, or {} (empty object means no auth required).`,
      },
    ]);
  });

  test("Should return an error message if security array contains invalid key", function () {
    expect(pathOauthScopeCheck(jsonInvalidKey, { rule: ruleNumber })).toEqual([
      {
        message: `Rule ${ruleNumber}: Operations must have security.userAuth and/or security.applicationAuth defined with at least one scope to access the endpoint. userAuthentication is not a valid key`,
      },
    ]);
  });
});
