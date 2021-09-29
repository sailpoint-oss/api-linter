var assert = require("assert");
let pathParameterIntegerNumberFormats = require("../path-parameter-integer-number-formats");
let ruleNumber = 171;

let jsonParameterWithValidNumberFormat = {
  in: "query",
  name: "numberTest",
  example: 10,
  schema: {
    type: "number",
    format: "double",
  },
};

let jsonParameterWithInvalidNumberFormat = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    format: "largeNumbers",
    example: 10.0,
  },
};

let jsonParameterWithFormatKeyMissingForNumber = {
  in: "query",
  name: "numberTest",
  schema: {
    type: "number",
    example: 10.0,
  },
};

let jsonParameterWithValidIntegerFormat = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "int32",
  },
  examples: [10, 50],
};

let jsonParameterWithInvalidIntegerFormat = {
  in: "query",
  name: "integerTest",
  schema: {
    type: "integer",
    format: "largeInteger",
  },
  examples: [10, 50],
};

let jsonParameterWithMissingFormatKeyForInteger = {
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
    assert.deepEqual(
      undefined,
      pathParameterIntegerNumberFormats(jsonParameterWithValidNumberFormat, {
        rule: ruleNumber,
      })
    );
  });

  it("Should return error with a valid number type but missing format key", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: ${jsonParameterWithFormatKeyMissingForNumber.name} is type ${jsonParameterWithFormatKeyMissingForNumber.schema.type} and must be one of the following values: float, double, decimal`,
        },
      ],
      pathParameterIntegerNumberFormats(
        jsonParameterWithFormatKeyMissingForNumber,
        {
          rule: ruleNumber,
        }
      )
    );
  });

  it("Should return error with a valid number type but invalid number format specified", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: ${jsonParameterWithInvalidNumberFormat.name} is type ${jsonParameterWithInvalidNumberFormat.schema.type} and must be one of the following values: float, double, decimal`,
        },
      ],
      pathParameterIntegerNumberFormats(jsonParameterWithInvalidNumberFormat, {
        rule: ruleNumber,
      })
    );
  });

  it("Should not return any errors with a valid integer type and integer format specified", function () {
    assert.deepEqual(
      undefined,
      pathParameterIntegerNumberFormats(jsonParameterWithValidIntegerFormat, {
        rule: ruleNumber,
      })
    );
  });

  it("Should return error with a valid integer type but missing format key", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: ${jsonParameterWithMissingFormatKeyForInteger.name} is type ${jsonParameterWithMissingFormatKeyForInteger.schema.type} and must be one of the following values: int32, int64, bigint`,
        },
      ],
      pathParameterIntegerNumberFormats(
        jsonParameterWithMissingFormatKeyForInteger,
        {
          rule: ruleNumber,
        }
      )
    );
  });

  it("Should return error with a valid integer type but invalid integer format specified", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: ${jsonParameterWithMissingFormatKeyForInteger.name} is type ${jsonParameterWithMissingFormatKeyForInteger.schema.type} and must be one of the following values: int32, int64, bigint`,
        },
      ],
      pathParameterIntegerNumberFormats(jsonParameterWithInvalidIntegerFormat, {
        rule: ruleNumber,
      })
    );
  });
});
