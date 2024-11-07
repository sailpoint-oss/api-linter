import { expect } from "chai";
import pathUserLevelsCheck from "../path-user-levels-check.js";

const ruleNumber = 321;

const jsonUserAuthNoUserLevels = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
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
    }
  ],
};

const jsonUserAuthAndUserLevelEmpty = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  'x-sailpoint-userLevels': [] 
};

const jsonUserAuthAndUserLevelsMispelled = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  'x-sailpoint-userlevels': ["ORG_ADMIN"] 
};

const jsonUserAuthAndUserLevels = {
  security: [
    {
      userAuth: ["idn:account-list:read"],
    },
  ],
  'x-sailpoint-userLevels': ["ORG_ADMIN"] 
};

const jsonApplicationAndUserAuthAndUserLevels = {
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
    expect(pathUserLevelsCheck(jsonUserAuthAndUserLevels, { rule: ruleNumber })).to.be.undefined;
  });

  it("Should return error message if x-sailpoint-userLevels mispelled", function () {
    expect(pathUserLevelsCheck(jsonUserAuthAndUserLevelsMispelled, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Improper spelling of x-sailpoint-userLevels. Please check your spelling, including capital letters.`,
      },
    ]);
  });

  it("Should return error message if x-sailpoint-userLevels has no items", function () {
    expect(pathUserLevelsCheck(jsonUserAuthAndUserLevelEmpty, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
      },
    ]);
  });

  it("Should return error message if user and application auth defined but no user levels", function () {
    expect(pathUserLevelsCheck(jsonApplicationAndUserAuthNoUserLevels, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
      },
    ]);
  });

  it("Should not return any error message if application auth defined but no user levels", function () {
    expect(pathUserLevelsCheck(jsonApplicationAuthNoUserLevels, { rule: ruleNumber })).to.be.undefined;
  });

  it("Should return error message if user auth defined but no user levels", function () {
    expect(pathUserLevelsCheck(jsonUserAuthNoUserLevels, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Operations that specify security.userAuth must define the necessary user levels`,
      },
    ]);
  });

  it("Should not return any error message if application auth defined but no user levels", function () {
    expect(pathUserLevelsCheck(jsonApplicationAndUserAuthAndUserLevels, { rule: ruleNumber })).to.be.undefined;
  });
});
