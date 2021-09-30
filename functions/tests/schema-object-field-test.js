var assert = require("assert");
let schemaObjectFieldCheck = require("../schema-object-field-check");
let ruleNumber = 317;
let field = "required";

let schemaObjectWithRequiredField = {
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
  required: ["oldApproverName", "newApproverName"],
};

let schemaObjectMissingRequiredField = {
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

let schemaAllOfObjectMissingRequiredField = {
  allOf: [
    {
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
    },
    {
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
    },
  ],
};

describe("Schema Object Field Check", function () {
  it("Should not return any errors when the given field is present", function () {
    assert.deepEqual(
      [],
      schemaObjectFieldCheck(schemaObjectWithRequiredField, {
        rule: ruleNumber,
        field: field,
      })
    );
  });

  it("Should return errors when the given field is missing", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: All schema objects must have a ${field} field defined`,
          path: ["required"],
        },
      ],
      schemaObjectFieldCheck(schemaObjectMissingRequiredField, {
        rule: ruleNumber,
        field: field,
      })
    );
  });

  it("Should return errors when the given field is missing in both allOf objects", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: All schema objects must have a ${field} field defined`,
          path: ["allOf", 0, "required"],
        },
        {
            message: `Rule ${ruleNumber}: All schema objects must have a ${field} field defined`,
            path: ["allOf", 1, "required"],
          }
      ],
      schemaObjectFieldCheck(schemaAllOfObjectMissingRequiredField, {
        rule: ruleNumber,
        field: field,
      })
    );
  });
});
