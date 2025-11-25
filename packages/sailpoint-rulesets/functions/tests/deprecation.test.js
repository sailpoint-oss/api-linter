import { describe, test, expect } from "vitest";
import deprecationCheck from "../deprecation.js";
describe("Deprecation Check", () => {
    const rule = "test-rule";
    test("should not return any errors if `deprecated` is not true", async () => {
        const targetVal = {
            deprecated: false,
            responses: {},
        };
        const options = { rule };
        const results = await deprecationCheck(targetVal, options);
        expect(results).toBeDefined();
        expect(results).toEqual([]);
    });
    test("should return an error if `deprecated` is true and no headers are defined", async () => {
        const targetVal = {
            deprecated: true,
            parameters: [],
            responses: {},
        };
        const options = { rule };
        const results = await deprecationCheck(targetVal, options);
        expect(results).toBeDefined();
        expect(results).toHaveLength(1);
        expect(results?.[0]?.message).toContain("should define deprecation and sunset dates in the header");
    });
    test("should return an error if `deprecated` is true and only `deprecation` header is defined", async () => {
        const targetVal = {
            deprecated: true,
            parameters: [{ in: "header", name: "deprecation" }],
            responses: {},
        };
        const options = { rule };
        const results = await deprecationCheck(targetVal, options);
        expect(results).toBeDefined();
        expect(results).toHaveLength(1);
        expect(results?.[0]?.message).toContain("should define sunset date in the header");
    });
    test("should return an error if `deprecated` is true and only `sunset` header is defined", async () => {
        const targetVal = {
            deprecated: true,
            parameters: [{ in: "header", name: "sunset" }],
            responses: {},
        };
        const options = { rule };
        const results = await deprecationCheck(targetVal, options);
        expect(results).toBeDefined();
        expect(results).toHaveLength(1);
        expect(results?.[0]?.message).toContain("should define deprecation date in the header");
    });
    test("should not return any errors if `deprecated` is true and both `deprecation` and `sunset` headers are defined", async () => {
        const targetVal = {
            deprecated: true,
            parameters: [
                { in: "header", name: "deprecation" },
                { in: "header", name: "sunset" },
            ],
            responses: {},
        };
        const options = { rule };
        const results = await deprecationCheck(targetVal, options);
        expect(results).toBeDefined();
        expect(results).toEqual([]);
    });
});
//# sourceMappingURL=deprecation.test.js.map