var assert = require("assert");
let pathValidator = require("../path-validator");
let ruleNumber = 151;

let validPath =
  "/identity-profiles/{identity-profile-id}/default-identity-attribute-config";

let invalidPath =
  "/identity-profiles/{identity-profile-id}/default-identity-attribute-config/sub-resource/sub-resource2";

describe("Path Validator Function", function () {
  it("Should not return any errors for valid paths", function () {
    assert.equal(
      undefined,
      pathValidator(validPath, {
        rule: ruleNumber,
      })
    );
  });

  it("Should return errors for invalid paths", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The path must not exceed 3 sub-resources`,
        },
      ],
      pathValidator(invalidPath, {
        rule: ruleNumber,
      })
    );
  });
});
