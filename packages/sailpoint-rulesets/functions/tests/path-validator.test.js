import { describe, test, expect } from "vitest";
import pathValidator from "../path-validator.js";
const ruleNumber = "151";
const validPath = "/identity-profiles/{identity-profile-id}/default-identity-attribute-config";
const invalidPath = "/identity-profiles/{identity-profile-id}/default-identity-attribute-config/sub-resource/sub-resource2";
describe("Path Validator Function", () => {
    test("Should not return any errors for valid paths", () => {
        expect(pathValidator(validPath, { rule: ruleNumber })).toBeUndefined();
    });
    test("Should return errors for invalid paths", () => {
        expect(pathValidator(invalidPath, { rule: ruleNumber })).toEqual([
            {
                message: `Rule ${ruleNumber}: The path must not exceed 3 sub-resources`,
            },
        ]);
    });
});
//# sourceMappingURL=path-validator.test.js.map