import { expect } from "chai";
import deprecationFunction from "../deprecation.js";

describe("Deprecation Check", function () {
  const rule = "test-rule";

  it("should not return any errors if `deprecated` is not true", function () {
    const targetVal = { deprecated: false };
    const options = { rule };
    const results = deprecationFunction(targetVal, options, { path: "get" });

    expect(results).to.be.an("array").that.is.empty;
  });

  it("should return an error if `deprecated` is true and no headers are defined", function () {
    const targetVal = { deprecated: true, parameters: [] };
    const options = { rule };
    const results = deprecationFunction(targetVal, options, { path: "get" });

    expect(results).to.have.lengthOf(1);
    expect(results[0].message).to.include("should define deprecation and sunset dates in the header");
  });

  it("should return an error if `deprecated` is true and only `deprecation` header is defined", function () {
    const targetVal = {
      deprecated: true,
      parameters: [{ in: "header", name: "deprecation" }],
    };
    const options = { rule };
    const results = deprecationFunction(targetVal, options, { path: "get" });

    expect(results).to.have.lengthOf(1);
    expect(results[0].message).to.include("should define sunset date in the header");
  });

  it("should return an error if `deprecated` is true and only `sunset` header is defined", function () {
    const targetVal = {
      deprecated: true,
      parameters: [{ in: "header", name: "sunset" }],
    };
    const options = { rule };
    const results = deprecationFunction(targetVal, options, { path: "get" });

    expect(results).to.have.lengthOf(1);
    expect(results[0].message).to.include("should define deprecation date in the header");
  });

  it("should not return any errors if `deprecated` is true and both `deprecation` and `sunset` headers are defined", function () {
    const targetVal = {
      deprecated: true,
      parameters: [
        { in: "header", name: "deprecation" },
        { in: "header", name: "sunset" },
      ],
    };
    const options = { rule };
    const results = deprecationFunction(targetVal, options, { path: "get" });

    expect(results).to.be.an("array").that.is.empty;
  });
});
