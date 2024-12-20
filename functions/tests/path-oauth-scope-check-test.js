import assert from "assert";
import pathOauthScopeCheck from "../path-oauth-scope-check.js";

const ruleNumber = 104;

const jsonNoAuthExplicit = {
  security: [{}],
};

const jsonNoAuthImplicit = {
  security: [],
};

const jsonApplicationAuthNoUserLevels = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
  ],
};

const jsonApplicationAndUserAuthNoUserLevels = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
};

const jsonInvalidKey = {
  security: [
    {
      userAuthentication: ["idn:account-list:read"],
    },
  ],
};

describe("Path Oauth Scope Check", function () {
  it("Should not return any error message when security array contains an explicit empty object", function () {
    assert.deepEqual(
      [],
      pathOauthScopeCheck(jsonNoAuthExplicit, {
        rule: ruleNumber,
      })
    );
  });

  it("Should not return any error message when security array contains one valid key", function () {
    assert.deepEqual(
      [],
      pathOauthScopeCheck(jsonApplicationAuthNoUserLevels, {
        rule: ruleNumber,
      })
    );
  });

  it("Should not return any error message when security array contains two valid keys", function () {
    assert.deepEqual(
      [],
      pathOauthScopeCheck(jsonApplicationAndUserAuthNoUserLevels, {
        rule: ruleNumber,
      })
    );
  });

  it("Should return an error message if security array is empty", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Operations must define the security array with one or more of the following values: userAuth, applicationAuth, or {} (empty object means no auth required).`,
        },
      ],
      pathOauthScopeCheck(jsonNoAuthImplicit, {
        rule: ruleNumber,
      })
    );
  });

  it("Should return an error message if security array contains invalid key", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Operations must have security.userAuth and/or security.applicationAuth defined with at least one scope to access the endpoint. userAuthentication is not a valid key`,
        },
      ],
      pathOauthScopeCheck(jsonInvalidKey, {
        rule: ruleNumber,
      })
    );
  });
});
