import { expect } from "chai";
import pathParameterIntegerNumberFormats from "../path-parameter-integer-number-formats.js";

const ruleNumber = 171;

const jsonParameterWithValidNumberFormat = {
  in: "query",
  name: "numberTest",
  example: 10,
  schema: {
    type: "number",
    format: "double",
  },
};

const jsonParameterWithInvalidNumberFormat = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "largeNumbers",
    example: 10.0,
  },
};

const jsonParameterWithFormatKeyMissingForNumber = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    example: 10.0,
  },
};

const jsonParameterWithValidIntegerFormat = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "int32",
  },
  examples: [10, 50],
};

const jsonParameterWithInvalidIntegerFormat = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "largeInteger",
  },
  examples: [10, 50],
};

const jsonParameterWithMissingFormatKeyForInteger = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "largeInteger",
  },
  examples: [10, 50],
};

describe("Path Parameter Number/Integer Format", function () {
  it("Should not return any errors with a valid number type and number format", function () {
    const result = pathParameterIntegerNumberFormats(jsonParameterWithValidNumberFormat, { rule: ruleNumber });
    expect(result).to.be.undefined;
  });

  it("Should return error with a valid number type but missing format key", function () {
    const result = pathParameterIntegerNumberFormats(jsonParameterWithFormatKeyMissingForNumber, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: ${jsonParameterWithFormatKeyMissingForNumber.name} is type ${jsonParameterWithFormatKeyMissingForNumber.schema.type} and must be one of the following values: float, double, decimal`,
      },
    ]);
  });

  it("Should return error with a valid number type but invalid number format specified", function () {
    const result = pathParameterIntegerNumberFormats(jsonParameterWithInvalidNumberFormat, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidNumberFormat.name} is type ${jsonParameterWithInvalidNumberFormat.schema.type} and must be one of the following values: float, double, decimal`,
      },
    ]);
  });

  it("Should not return any errors with a valid integer type and integer format specified", function () {
    const result = pathParameterIntegerNumberFormats(jsonParameterWithValidIntegerFormat, { rule: ruleNumber });
    expect(result).to.be.undefined;
  });

  it("Should return error with a valid integer type but missing format key", function () {
    const result = pathParameterIntegerNumberFormats(jsonParameterWithMissingFormatKeyForInteger, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: ${jsonParameterWithMissingFormatKeyForInteger.name} is type ${jsonParameterWithMissingFormatKeyForInteger.schema.type} and must be one of the following values: int32, int64, bigint`,
      },
    ]);
  });

  it("Should return error with a valid integer type but invalid integer format specified", function () {
    const result = pathParameterIntegerNumberFormats(jsonParameterWithInvalidIntegerFormat, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: ${jsonParameterWithMissingFormatKeyForInteger.name} is type ${jsonParameterWithMissingFormatKeyForInteger.schema.type} and must be one of the following values: int32, int64, bigint`,
      },
    ]);
  });
});
