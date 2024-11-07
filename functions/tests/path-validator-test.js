import { expect } from "chai";
import pathValidator from "../path-validator.js";

const ruleNumber = 151;

const validPath = "/identity-profiles/{identity-profile-id}/default-identity-attribute-config";

const invalidPath = "/identity-profiles/{identity-profile-id}/default-identity-attribute-config/sub-resource/sub-resource2";

describe("Path Validator Function", function () {
  it("Should not return any errors for valid paths", function () {
    expect(pathValidator(validPath, { rule: ruleNumber })).to.be.undefined;
  });

  it("Should return errors for invalid paths", function () {
    expect(pathValidator(invalidPath, { rule: ruleNumber })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: The path must not exceed 3 sub-resources`,
      },
    ]);
  });
});
