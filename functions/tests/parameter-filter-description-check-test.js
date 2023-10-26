var assert = require("assert");
let parameterFilterDescriptionCheck = require("../parameter-filter-description-check");
let ruleNumber = 324;

let validFilterDescription = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq, in*

**name**: *eq, sw*

**created**: *gt, lt, ge, le*`;

let multiplePropertiesOnSameLine = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**created, modified**: *gt, lt, ge, le*`;

let unsupportedOperator = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq, un*`

let singleNewLine = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)
Filtering is supported for the following fields and operators:
**id**: *eq, un*
**created**: *gt, lt, ge, le*`

let badIntro = `This is a bad intro

Filtering is supported for the following fields and operators:

**id**: *eq, co*`

let propertyNotBolded = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

id: *eq, co*`

let operatorNotItalicized = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: **eq, co**`

let operatorsNotSeparated = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq co*`

let additionalInfoInOperator = `Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)

Filtering is supported for the following fields and operators:

**id**: *eq, in (not valid), co*`

describe("Filter param description", function() {
  it("Should not return any errors for valid input", function() {
    assert.equal(
      undefined,
      parameterFilterDescriptionCheck(validFilterDescription, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for multiple properties on same line", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The properties created, modified must be on separate lines.`,
        },
      ],
      parameterFilterDescriptionCheck(multiplePropertiesOnSameLine, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for unsupported operator", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The property id contains an unsupported filter operator (un).`,
        },
      ],
      parameterFilterDescriptionCheck(unsupportedOperator, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for not enough new lines", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Each line in the description for filters must always be separated by two lines.`,
        },
      ],
      parameterFilterDescriptionCheck(singleNewLine, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for bad intro", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The first two lines in the description for filters must follow the example provided in the guide for rule ${ruleNumber}.`,
        },
      ],
      parameterFilterDescriptionCheck(badIntro, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for property not bolded", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The property id must be bolded (ex **id**).`,
        },
      ],
      parameterFilterDescriptionCheck(propertyNotBolded, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for operator not italicized", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The operators for id must be italicized (ex *eq, co, le*).`,
        },
      ],
      parameterFilterDescriptionCheck(operatorNotItalicized, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for operators not separated", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The operators for id must be separated with commas and spaces (ex. *eq, co, le*).`,
        },
      ],
      parameterFilterDescriptionCheck(operatorsNotSeparated, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for additional info in operator", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The operators for id must be separated with commas and spaces (ex. *eq, co, le*).`,
        },
      ],
      parameterFilterDescriptionCheck(additionalInfoInOperator, {
        rule: ruleNumber
      })
    );
  });
});
