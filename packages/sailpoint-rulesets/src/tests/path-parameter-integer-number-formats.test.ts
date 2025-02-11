import { describe, test, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import pathParameterIntegerNumberFormats from "../path-parameter-integer-number-formats.js";

const ruleNumber = "171";

const jsonParameterWithValidNumberFormat: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "numberTest",
  example: 10,
  schema: {
    type: "number",
    format: "double",
  },
};

const jsonParameterWithInvalidNumberFormat: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "largeNumbers",
    example: 10.0,
  },
};

const jsonParameterWithFormatKeyMissingForNumber: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    example: 10.0,
  },
};

const jsonParameterWithValidIntegerFormat: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "int32",
  },
  examples: {
    ten: {
      value: 10,
    },
    fifty: {
      value: 50,
    },
  },
};

const jsonParameterWithInvalidIntegerFormat: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "largeInteger",
  },
  examples: {
    ten: {
      value: 10,
    },
    fifty: {
      value: 50,
    },
  },
};

const jsonParameterWithMissingFormatKeyForInteger: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "largeInteger",
  },
  examples: {
    ten: {
      value: 10,
    },
    fifty: {
      value: 50,
    },
  },
};

describe("Path Parameter Number/Integer Format", () => {
  test("Should not return any errors with a valid number type and number format", () => {
    const result = pathParameterIntegerNumberFormats(
      jsonParameterWithValidNumberFormat,
      { rule: ruleNumber },
    );
    expect(result).toBeUndefined();
  });

  test("Should return error with a valid number type but missing format key", function () {
    const result = pathParameterIntegerNumberFormats(
      jsonParameterWithFormatKeyMissingForNumber,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        // @ts-expect-error Sometimes TS is just wrong and silly
        message: `Rule ${ruleNumber}: ${jsonParameterWithFormatKeyMissingForNumber.name} is type ${jsonParameterWithFormatKeyMissingForNumber.schema.type} and must be one of the following values: float, double, decimal`,
      },
    ]);
  });

  test("Should return error with a valid number type but invalid number format specified", function () {
    const result = pathParameterIntegerNumberFormats(
      jsonParameterWithInvalidNumberFormat,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        // @ts-expect-error Sometimes TS is just wrong and silly
        message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidNumberFormat.name} is type ${jsonParameterWithInvalidNumberFormat.schema.type} and must be one of the following values: float, double, decimal`,
      },
    ]);
  });

  test("Should not return any errors with a valid integer type and integer format specified", function () {
    const result = pathParameterIntegerNumberFormats(
      jsonParameterWithValidIntegerFormat,
      { rule: ruleNumber },
    );
    expect(result).toBeUndefined();
  });

  test("Should return error with a valid integer type but missing format key", function () {
    const result = pathParameterIntegerNumberFormats(
      jsonParameterWithMissingFormatKeyForInteger,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        // @ts-expect-error Sometimes TS is just wrong and silly
        message: `Rule ${ruleNumber}: ${jsonParameterWithMissingFormatKeyForInteger.name} is type ${jsonParameterWithMissingFormatKeyForInteger.schema.type} and must be one of the following values: int32, int64, bigint`,
      },
    ]);
  });

  test("Should return error with a valid integer type but invalid integer format specified", function () {
    const result = pathParameterIntegerNumberFormats(
      jsonParameterWithInvalidIntegerFormat,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        // @ts-expect-error Sometimes TS is just wrong and silly
        message: `Rule ${ruleNumber}: ${jsonParameterWithMissingFormatKeyForInteger.name} is type ${jsonParameterWithMissingFormatKeyForInteger.schema.type} and must be one of the following values: int32, int64, bigint`,
      },
    ]);
  });
});
