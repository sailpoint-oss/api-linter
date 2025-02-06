import { expect } from "chai";
import parameterExampleCheck from "../parameter-example-check.js";
const ruleNumber = 304;

const jsonParameterWithValidExample = {
  in: "query",
  name: "numberTest",
  example: 10,
  schema: {
    type: "number",
    format: "double",
  },
};

const jsonParameterWithValidSchemaExample = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
    example: 10.0,
  },
};

const jsonParameterWithValidSchemaExamples = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
  },
  examples: [10.0, 50.0],
};

const jsonParameterWithMissingExample = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
  },
};

describe("Path Parameter Example Check Test", function () {
  it("should not return any error messages if path parameter has a root level key example", function () {
    const result = parameterExampleCheck(jsonParameterWithValidExample, { rule: ruleNumber });
    expect(result).to.be.undefined;
  });

  it("should not return any error messages if path parameter has a schema level key example", function () {
    const result = parameterExampleCheck(jsonParameterWithValidSchemaExample, { rule: ruleNumber });
    expect(result).to.be.undefined;
  });

  it("should not return any error messages if path parameter has root level key examples", function () {
    const result = parameterExampleCheck(jsonParameterWithValidSchemaExamples, { rule: ruleNumber });
    expect(result).to.be.undefined;
  });

  it("should return an error message for missing example", function () {
    const result = parameterExampleCheck(jsonParameterWithMissingExample, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: An example for ${jsonParameterWithMissingExample.name} must be provided under one of the following keys: example, schema.example, examples`,
      },
    ]);
  });
});
