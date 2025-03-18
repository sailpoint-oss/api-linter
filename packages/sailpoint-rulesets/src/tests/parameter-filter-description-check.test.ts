import { describe, test, expect } from "vitest";
import parameterFilterDescriptionCheck from "../parameter-filter-description-check.js";

const ruleNumber = "324";

const validFilterDescription = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq, in*

**name**: *eq, sw*

**created**: *gt, lt, ge, le*`;

const multiplePropertiesOnSameLine = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**created, modified**: *gt, lt, ge, le*`;

const unsupportedOperator = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq, un*`;

const singleNewLine = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)
Filtering is supported for the following fields and operators:
**id**: *eq, un*
**created**: *gt, lt, ge, le*`;

const badIntro = `This is a bad intro

Filtering is supported for the following fields and operators:

**id**: *eq, co*`;

const propertyNotBolded = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

id: *eq, co*`;

const operatorNotItalicized = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: **eq, co**`;

const operatorsNotSeparated = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq co*`;

const additionalInfoInOperator = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq, in (not valid), co*`;

describe("Filter param description", () => {
  test("Should not return any errors for valid input", () => {
    const result = parameterFilterDescriptionCheck(validFilterDescription, {
      rule: ruleNumber,
    });
    expect(result).toBeUndefined();
  });

  test("Should return an error for multiple properties on same line", () => {
    const result = parameterFilterDescriptionCheck(
      multiplePropertiesOnSameLine,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: The properties created, modified must be on separate lines.`,
      },
    ]);
  });

  test("Should return an error for unsupported operator", () => {
    const result = parameterFilterDescriptionCheck(unsupportedOperator, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: The property id contains an unsupported filter operator (un).`,
      },
    ]);
  });

  test("Should return an error for not enough new lines", () => {
    const result = parameterFilterDescriptionCheck(singleNewLine, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Each line in the description for filters must always be separated by two lines.`,
      },
    ]);
  });

  test("Should return an error for bad intro", () => {
    const result = parameterFilterDescriptionCheck(badIntro, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: The first two lines in the description for filters must follow the example provided in the guide for rule ${ruleNumber}.`,
      },
    ]);
  });

  test("Should return an error for property not bolded", () => {
    const result = parameterFilterDescriptionCheck(propertyNotBolded, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: The property id must be bolded (ex **id**).`,
      },
    ]);
  });

  test("Should return an error for operator not italicized", () => {
    const result = parameterFilterDescriptionCheck(operatorNotItalicized, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: The operators for id must be italicized (ex *eq, co, le*).`,
      },
    ]);
  });

  test("Should return an error for operators not separated", () => {
    const result = parameterFilterDescriptionCheck(operatorsNotSeparated, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: The operators for id must be separated with commas and spaces (ex. *eq, co, le*).`,
      },
    ]);
  });

  test("Should return an error for additional info in operator", () => {
    const result = parameterFilterDescriptionCheck(additionalInfoInOperator, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: The operators for id must be separated with commas and spaces (ex. *eq, co, le*).`,
      },
    ]);
  });
});
