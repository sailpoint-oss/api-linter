import { describe, test, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import pathUserLevelsCheck from "../path-user-levels-check.js";

const ruleNumber = "321";

const jsonUserAuthNoUserLevels: OpenAPIV3.OperationObject = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
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

const jsonUserAuthAndUserLevelEmpty: OpenAPIV3.OperationObject = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  // @ts-expect-error OpenAPI Extenstions are valid
  "x-sailpoint-userLevels": [],
};

const jsonUserAuthAndUserLevelsMispelled: OpenAPIV3.OperationObject = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  // @ts-expect-error OpenAPI Extenstions are valid
  "x-sailpoint-userlevels": ["ORG_ADMIN"],
};

const jsonUserAuthAndUserLevels: OpenAPIV3.OperationObject = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  responses: {},
  // @ts-expect-error OpenAPI Extenstions are valid
  "x-sailpoint-userLevels": ["ORG_ADMIN"],
};

const jsonApplicationAndUserAuthAndUserLevels: OpenAPIV3.OperationObject = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  responses: {},
  // @ts-expect-error OpenAPI Extenstions are valid
  "x-sailpoint-userLevels": ["ORG_ADMIN"],
};

describe("Path User Levels Check", () => {
  test("Should not return any error message if userAuth and at least one user level", () => {
    expect(
      pathUserLevelsCheck(jsonUserAuthAndUserLevels, { rule: ruleNumber }),
    ).toBeUndefined();
  });

  test("Should return error message if x-sailpoint-userLevels mispelled", () => {
    expect(
      pathUserLevelsCheck(jsonUserAuthAndUserLevelsMispelled, {
        rule: ruleNumber,
      }),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Improper spelling of x-sailpoint-userLevels. Please check your spelling, including capital letters.`,
      },
    ]);
  });

  test("Should return error message if x-sailpoint-userLevels has no items", () => {
    expect(
      pathUserLevelsCheck(jsonUserAuthAndUserLevelEmpty, { rule: ruleNumber }),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
      },
    ]);
  });

  test("Should return error message if user and application auth defined but no user levels", () => {
    expect(
      pathUserLevelsCheck(jsonApplicationAndUserAuthNoUserLevels, {
        rule: ruleNumber,
      }),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
      },
    ]);
  });

  test("Should not return any error message if application auth defined but no user levels", () => {
    expect(
      pathUserLevelsCheck(jsonApplicationAuthNoUserLevels, {
        rule: ruleNumber,
      }),
    ).toBeUndefined();
  });

  test("Should return error message if user auth defined but no user levels", () => {
    expect(
      pathUserLevelsCheck(jsonUserAuthNoUserLevels, { rule: ruleNumber }),
    ).toEqual([
      {
        message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
      },
    ]);
  });

  test("Should not return any error message if application auth defined and user levels are present", () => {
    expect(
      pathUserLevelsCheck(jsonApplicationAndUserAuthAndUserLevels, {
        rule: ruleNumber,
      }),
    ).toBeUndefined();
  });
});
