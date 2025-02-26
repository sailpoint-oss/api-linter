import { describe, test, expect } from "vitest";
import parameterExampleCheck from "../parameter-example-check.js";
import { OpenAPIV3 } from "openapi-types";

const ruleNumber = "304";

const jsonParameterWithValidExample: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "numberTest",
  example: 10,
  schema: {
    type: "number",
    format: "double",
  },
};

const jsonParameterWithValidSchemaExample: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
    example: 10.0,
  },
};

const jsonParameterWithValidSchemaExamples: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
  },
  examples: {
    ten: {
      value: 10.0,
    },
    fifty: {
      value: 50.0,
    },
  },
};

const jsonParameterWithMissingExample: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "double",
  },
};

describe("Path Parameter Example Check Test", () => {
  test("should not return any error messages if path parameter has a root level key example", () => {
    const result = parameterExampleCheck(jsonParameterWithValidExample, {
      rule: ruleNumber,
    });
    expect(result).toBeUndefined();
  });

  test("should not return any error messages if path parameter has a schema level key example", function () {
    const result = parameterExampleCheck(jsonParameterWithValidSchemaExample, {
      rule: ruleNumber,
    });
    expect(result).toBeUndefined();
  });

  test("should not return any error messages if path parameter has root level key examples", function () {
    const result = parameterExampleCheck(jsonParameterWithValidSchemaExamples, {
      rule: ruleNumber,
    });
    expect(result).toBeUndefined();
  });

  test("should return an error message for missing example", function () {
    const result = parameterExampleCheck(jsonParameterWithMissingExample, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: An example for ${jsonParameterWithMissingExample.name} must be provided under one of the following keys: example, schema.example, examples`,
      },
    ]);
  });
});
