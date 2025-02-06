import { expect } from "chai";
import parameterSorterDescriptionCheck from "../parameter-sorter-description-check.js";

const ruleNumber = 325;

const validSorterDescription = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: **owner.name, name, identity.manager, modified, identityId**`;

const badKeyForFields = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

You can sort on the following fields: **name, created, modified**`;

const dashInFieldName = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: **name, -created, modified**`;

const singleNewLine = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)
Sorting is supported for the following fields: **name, created, modified**`;

const badIntro = `This is a bad intro

Sorting is supported for the following fields: **name, created, modified**`;

const fieldsNotBolded = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: name, created, modified`;

const fieldsNotSeparated = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields: **name created modified**`;

const fieldsOnSeparateLines = `Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)

Sorting is supported for the following fields:

- name
- created
- modified`;

describe("Sorter param description", function () {
  it("Should not return any errors for valid input", function () {
    const result = parameterSorterDescriptionCheck(validSorterDescription, { rule: ruleNumber });
    expect(result).to.be.undefined;
  });

  it("Should return an error for bad key for fields", function () {
    const result = parameterSorterDescriptionCheck(badKeyForFields, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Must use the following format when describing sortable fields: "Sorting is supported for the following fields: **name, created, etc**".`,
      },
    ]);
  });

  it("Should return an error for a dash in a field", function () {
    const result = parameterSorterDescriptionCheck(dashInFieldName, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Dashes are not allowed when listing supported fields.  Fields must support both ascending and descending.`,
      },
    ]);
  });

  it("Should return an error for not enough new lines", function () {
    const result = parameterSorterDescriptionCheck(singleNewLine, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Each line in the description for sorters must always be separated by two lines.`,
      },
    ]);
  });

  it("Should return an error for bad intro", function () {
    const result = parameterSorterDescriptionCheck(badIntro, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: The first line in the description for sorters must follow the example provided in the guide for rule ${ruleNumber}.`,
      },
    ]);
  });

  it("Should return an error for fields not bolded", function () {
    const result = parameterSorterDescriptionCheck(fieldsNotBolded, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: The sortable fields list must be bolded (ex. **name, created, modified**).`,
      },
    ]);
  });

  it("Should return an error for fields not separated", function () {
    const result = parameterSorterDescriptionCheck(fieldsNotSeparated, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: The sortable fields must be separated with commas and spaces (ex. **name, created, modified**).`,
      },
    ]);
  });

  it("Should return an error for fields on separate lines", function () {
    const result = parameterSorterDescriptionCheck(fieldsOnSeparateLines, { rule: ruleNumber });
    expect(result).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: Each line in the description for sorters must always be separated by two lines.`,
      },
    ]);
  });
});
