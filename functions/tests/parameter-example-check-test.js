var assert = require("assert");
let parameterExampleCheck = require("../parameter-example-check");
let ruleNumber = 304;

let jsonParameterWithValidExample = {
  in: "query",
  name: "numberTest",
  example: 10,
  schema: {
    type: "number",
    format: "double",
  },
};

let jsonParameterWithValidSchemaExample = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
    example: 10.0,
  },
};

let jsonParameterWithValidSchemaExamples = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
  },
  examples: [10.0, 50.0],
};

let jsonParameterWithMissingExample = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
  },
};

describe("Path Parameter Example Check Test", function () {
  it("Should not return any error messages if path parameter has a root level key example", function () {
    assert.deepEqual(
      undefined,
      parameterExampleCheck(jsonParameterWithValidExample, { rule: ruleNumber })
    );
  });

  it("Should not return any error messages if path parameter has a schema level key example", function () {
    assert.deepEqual(
      undefined,
      parameterExampleCheck(jsonParameterWithValidSchemaExample, {
        rule: ruleNumber,
      })
    );
  });

  it("Should not return any error messages if path parameter has root level key examples", function () {
    assert.deepEqual(
      undefined,
      parameterExampleCheck(jsonParameterWithValidSchemaExamples, {
        rule: ruleNumber,
      })
    );
  });

  it("Should return error message for missing example", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: An example for ${jsonParameterWithMissingExample.name} must be provided under one of the following keys: example, schema.example, examples`,
        },
      ],
      parameterExampleCheck(jsonParameterWithMissingExample, {
        rule: ruleNumber,
      })
    );
  });
});
