var assert = require("assert");
let parameterSorterDescriptionCheck = require("../parameter-sorter-description-check");
let ruleNumber = 325;

let validSorterDescription = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: **owner.name, name, identity.manager, modified, identityId**`;

let badKeyForFields = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

You can sort on the following fields: **name, created, modified**`;

let dashInFieldName = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: **name, -created, modified**`;

let singleNewLine = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)
Sorting is supported for the following fields: **name, created, modified**`

let badIntro = `This is a bad intro

Sorting is supported for the following fields: **name, created, modified**`

let fieldsNotBolded = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: name, created, modified`

let fieldsNotSeparated = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: **name created modified**`

let fieldsOnSeparateLines = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields:

- name
- created
- modified`


describe("Sorter param description", function() {
  it("Should not return any errors for valid input", function() {
    assert.equal(
      undefined,
      parameterSorterDescriptionCheck(validSorterDescription, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for bad key for fields", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Must use the following format when describing sortable fields: "Sorting is supported for the following fields: **name, created, etc**".`,
        },
      ],
      parameterSorterDescriptionCheck(badKeyForFields, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for a dash in a field", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Dashes are not allowed when listing supported fields.  Fields must support both ascending and descending.`,
        },
      ],
      parameterSorterDescriptionCheck(dashInFieldName, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for not enough new lines", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Each line in the description for sorters must always be separated by two lines.`,
        },
      ],
      parameterSorterDescriptionCheck(singleNewLine, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for bad intro", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The first line in the description for sorters must follow the example provided in the guide for rule ${ruleNumber}.`,
        },
      ],
      parameterSorterDescriptionCheck(badIntro, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for fields not bolded", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The sortable fields list must be bolded (ex. **name, created, modified**).`,
        },
      ],
      parameterSorterDescriptionCheck(fieldsNotBolded, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for fields not separated", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The sortable fields must be separated with commas and spaces (ex. **name, created, modified**).`,
        },
      ],
      parameterSorterDescriptionCheck(fieldsNotSeparated, {
        rule: ruleNumber
      })
    );
  });

  it("Should return an error for fields on separate lines", function() {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: Each line in the description for sorters must always be separated by two lines.`,
        },
      ],
      parameterSorterDescriptionCheck(fieldsOnSeparateLines, {
        rule: ruleNumber
      })
    );
  });
});
