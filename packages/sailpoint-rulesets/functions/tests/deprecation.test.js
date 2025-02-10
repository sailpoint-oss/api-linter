import deprecationCheck from "../deprecation.js";

describe("Deprecation Check", () => {
  const rule = "test-rule";

  test("should not return any errors if `deprecated` is not true", () => {
    const targetVal = { deprecated: false };
    const options = { rule };
    const results = deprecationCheck(targetVal, options, { path: "get" });
    expect(results).toEqual([]);
  });

  test("should return an error if `deprecated` is true and no headers are defined", () => {
    const targetVal = { deprecated: true, parameters: [] };
    const options = { rule };
    const results = deprecationCheck(targetVal, options, { path: "get" });
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain("should define deprecation and sunset dates in the header");
  });

  test("should return an error if `deprecated` is true and only `deprecation` header is defined", () => {
    const targetVal = {
      deprecated: true,
      parameters: [{ in: "header", name: "deprecation" }],
    };
    const options = { rule };
    const results = deprecationCheck(targetVal, options, { path: "get" });
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain("should define sunset date in the header");
  });

  test("should return an error if `deprecated` is true and only `sunset` header is defined", () => {
    const targetVal = {
      deprecated: true,
      parameters: [{ in: "header", name: "sunset" }],
    };
    const options = { rule };
    const results = deprecationCheck(targetVal, options, { path: "get" });
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain("should define deprecation date in the header");
  });

  test("should not return any errors if `deprecated` is true and both `deprecation` and `sunset` headers are defined", () => {
    const targetVal = {
      deprecated: true,
      parameters: [
        { in: "header", name: "deprecation" },
        { in: "header", name: "sunset" },
      ],
    };
    const options = { rule };
    const results = deprecationCheck(targetVal, options, { path: "get" });
    expect(results).toEqual([]);
  });
});
