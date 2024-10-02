var assert = require("assert");
let pathUserLevelsCheck = require("../path-user-levels-check");
let ruleNumber = 321;

let jsonUserAuthNoUserLevels = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
};

let jsonApplicationAuthNoUserLevels = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
  ],
};

let jsonApplicationAndUserAuthNoUserLevels = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
    {
      userAuth: ["idn:account-list:read"],
    }
  ],
};

let jsonUserAuthAndUserLevelEmpty = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  'x-sailpoint-userLevels': [] 
};

let jsonUserAuthAndUserLevelsMispelled = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  'x-sailpoint-userlevels': ["ORG_ADMIN"] 
};

let jsonUserAuthAndUserLevels = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  'x-sailpoint-userLevels': ["ORG_ADMIN"] 
};

let jsonApplicationAndUserAuthAndUserLevels = {
  security: [
    {
      applicationAuth: ["idn:account-list:read"],
    },
    {
      userAuth: ["idn:account-list:read"],
    }
  ],
  'x-sailpoint-userLevels': ["ORG_ADMIN"] 
};

describe("Path User Levels Check", function () {
  it("Should not return any error message if userAuth and at least one user level", function () {
    assert.deepEqual(
      undefined,
      pathUserLevelsCheck(jsonUserAuthAndUserLevels, {
        rule: ruleNumber
      })
    );
  });

  it("Should return error message if x-sailpoint-userLevels mispelled", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Improper spelling of x-sailpoint-userLevels. Please check your spelling, including capital letters.`,
        },
      ],
      pathUserLevelsCheck(jsonUserAuthAndUserLevelsMispelled, {
        rule: ruleNumber
      })
    );
  });

  it("Should return error message if x-sailpoint-userLevels has no items", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
        },
      ],
      pathUserLevelsCheck(jsonUserAuthAndUserLevelEmpty, {
        rule: ruleNumber
      })
    );
  });

  it("Should return error message if user and application auth defined but no user levels", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
        },
      ],
      pathUserLevelsCheck(jsonApplicationAndUserAuthNoUserLevels, {
        rule: ruleNumber
      })
    );
  });

  it("Should not return any error message if application auth defined but no user levels", function () {
    assert.deepEqual(
      undefined,
      pathUserLevelsCheck(jsonApplicationAuthNoUserLevels, {
        rule: ruleNumber
      })
    );
  });

  it("Should return error message if user auth defined but no user levels", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
        },
      ],
      pathUserLevelsCheck(jsonUserAuthNoUserLevels, {
        rule: ruleNumber
      })
    );
  });

  it("Should not return any error message if application auth defined but no user levels", function () {
    assert.deepEqual(
      undefined,
      pathUserLevelsCheck(jsonApplicationAndUserAuthAndUserLevels, {
        rule: ruleNumber
      })
    );
  });
});
