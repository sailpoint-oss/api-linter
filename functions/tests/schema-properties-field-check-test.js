var assert = require("assert");
let schemaPropertiesFieldCheck = require("../schema-properties-field-check");
let ruleNumber = 304;

let allOfParametersCheck = {
  allOf: [
    {
      type: "object",
      required: ["name"],
      properties: {
        id: {
          description: "System-generated unique ID of the Object",
          type: "string",
          example: "id12345",
          readOnly: true,
        },
        name: {
          description: "Name of the Object",
          type: "string",
          example: "aName",
        },
        created: {
          description: "Creation date of the Object",
          type: "string",
          format: "date-time",
          readOnly: true,
          example: "2019-08-23T18:52:57.398Z",
        },
        modified: {
          description: "Last modification date of the Object",
          type: "string",
          format: "date-time",
          readOnly: true,
          example: "2019-08-23T18:52:57.398Z",
        },
      },
    },
    {
      type: "object",
      properties: {
        sourceId: {
          type: "string",
          example: "2c9180835d2e5168015d32f890ca1581",
        },
        identityId: {
          type: "string",
          example: "2c9180835d2e5168015d32f890ca1581",
        },
        authoritative: {
          type: "boolean",
          example: true,
        },
        description: {
          type: "string",
          example: "This is a description",
        },
        disabled: {
          type: "boolean",
          example: false,
        },
      },
    },
  ],
};

let allOfParametersCheckWithMissingExamples = {
  allOf: [
    {
      type: "object",
      required: ["name"],
      properties: {
        id: {
          description: "System-generated unique ID of the Object",
          type: "string",
          example: "id12345",
          readOnly: true,
        },
        name: {
          description: "Name of the Object",
          type: "string",
          example: "aName",
        },
        created: {
          description: "Creation date of the Object",
          type: "string",
          format: "date-time",
          readOnly: true,
          example: "2019-08-23T18:52:57.398Z",
        },
        modified: {
          description: "Last modification date of the Object",
          type: "string",
          format: "date-time",
          readOnly: true,
        },
      },
    },
    {
      type: "object",
      properties: {
        sourceId: {
          type: "string",
          example: "2c9180835d2e5168015d32f890ca1581",
        },
        identityId: {
          type: "string",
          example: "2c9180835d2e5168015d32f890ca1581",
        },
        authoritative: {
          type: "boolean",
          example: true,
        },
        description: {
          type: "string",
        },
        disabled: {
          type: "boolean",
        },
      },
    },
  ],
};

let singleObjectParameterCheckWithMissingExamples = {
  type: "object",
  properties: {
    oldApproverName: {
      type: "string",
      description: "Display name of approver that forwarded the approval.",
    },
    newApproverName: {
      type: "string",
      description:
        "Display name of approver to whom the approval was forwarded.",
    },
    comment: {
      type: "string",
      description: "Comment made by old approver when forwarding.",
      example: "Fusce id orci vel consectetur amet ipsum quam.",
    },
    modified: {
      type: "string",
      format: "date-time",
      description: "Time at which approval was forwarded.",
      example: "2019-08-23T18:52:57.398Z",
    },
  },
};

let singleObjectParameterCheckWithValidExamples = {
  type: "object",
  properties: {
    oldApproverName: {
      type: "string",
      description: "Display name of approver that forwarded the approval.",
      example: "frank.mir",
    },
    newApproverName: {
      type: "string",
      description:
        "Display name of approver to whom the approval was forwarded.",
      example: "al.volta",
    },
    comment: {
      type: "string",
      description: "Comment made by old approver when forwarding.",
      example: "Fusce id orci vel consectetur amet ipsum quam.",
    },
    modified: {
      type: "string",
      format: "date-time",
      description: "Time at which approval was forwarded.",
      example: "2019-08-23T18:52:57.398Z",
    },
  },
};

let singleParameterWithMissingExample = {
  type: "string",
  enum: ["GRANT_ACCESS", "REVOKE_ACCESS"],
  description:
    "Access request type. Defaults to GRANT_ACCESS. REVOKE_ACCESS type can only have a single Identity ID in the requestedFor field. Currently REVOKE_ACCESS is not supported for entitlements.",
};

let singleParameterWithValidExample = {
  type: "string",
  enum: ["GRANT_ACCESS", "REVOKE_ACCESS"],
  description:
    "Access request type. Defaults to GRANT_ACCESS. REVOKE_ACCESS type can only have a single Identity ID in the requestedFor field. Currently REVOKE_ACCESS is not supported for entitlements.",
  example: "GRANT_ACCESS",
};

describe("Parameter example check", function () {
  it("Should not return any error messages when all parameters have an example", function () {
    assert.deepEqual(
      [],
      schemaPropertiesFieldCheck(allOfParametersCheck, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });

  it("Should return all properties that do not have an example", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The property modified must have a example`,
          path: ["allOf", 0, "properties", "modified", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property description must have a example`,
          path: ["allOf", 1, "properties", "description", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property disabled must have a example`,
          path: ["allOf", 1, "properties", "disabled", "example"],
        },
      ],
      schemaPropertiesFieldCheck(allOfParametersCheckWithMissingExamples, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });

  it("Should return all properties that do not have an example for a single object", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The property oldApproverName must have a example`,
          path: ["properties", "properties", "oldApproverName", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property newApproverName must have a example`,
          path: ["properties", "properties", "newApproverName", "example"],
        },
      ],
      schemaPropertiesFieldCheck(
        singleObjectParameterCheckWithMissingExamples,
        {
          rule: ruleNumber,
          field: "example",
        }
      )
    );
  });

  it("Should not return any error messages for a single object when all parameters have an example", function () {
    assert.deepEqual(
      [],
      schemaPropertiesFieldCheck(singleObjectParameterCheckWithValidExamples, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });

  it("Should return error message for a single property without an example", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: This field must have a example`,
          path: ["example"],
        },
      ],
      schemaPropertiesFieldCheck(singleParameterWithMissingExample, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });

  it("Should return no errors for a single property with a valid example", function () {
    assert.deepEqual(
      [],
      schemaPropertiesFieldCheck(singleParameterWithValidExample, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });


});
