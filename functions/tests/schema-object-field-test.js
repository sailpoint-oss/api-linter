import { expect } from "chai";
import schemaObjectFieldCheck from "../schema-object-field-check.js";

const ruleNumber = 317;
const field = "required";

const schemaObjectWithRequiredField = {
  type: "object",
  properties: {
    oldApproverName: {
      type: "string",
      description: "Display name of approver that forwarded the approval.",
      example: "frank.mir",
    },
    newApproverName: {
      type: "string",
      description: "Display name of approver to whom the approval was forwarded.",
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

const schemaObjectMissingRequiredField = {
  type: "object",
  properties: {
    oldApproverName: {
      type: "string",
      description: "Display name of approver that forwarded the approval.",
      example: "frank.mir",
    },
    newApproverName: {
      type: "string",
      description: "Display name of approver to whom the approval was forwarded.",
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

const schemaObjectWithNullRequiredField = {
  type: "object",
  properties: {
    oldApproverName: {
      type: "string",
      description: "Display name of approver that forwarded the approval.",
      example: "frank.mir",
    },
    newApproverName: {
      type: "string",
      description: "Display name of approver to whom the approval was forwarded.",
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
  required: null,
};

const schemaAllOfObjectWithMissingRequiredField = {
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
          description: "Display name of approver to whom the approval was forwarded.",
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
          description: "Display name of approver to whom the approval was forwarded.",
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

const schemaAllOfObjectWithNullRequiredField = {
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
          description: "Display name of approver to whom the approval was forwarded.",
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
      required: [],
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
          description: "Display name of approver to whom the approval was forwarded.",
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
    expect(schemaObjectFieldCheck(schemaObjectWithRequiredField, { rule: ruleNumber, field: field })).to.deep.equal([]);
  });

  it("Should not return any errors when the given field is missing", function () {
    expect(schemaObjectFieldCheck(schemaObjectMissingRequiredField, { rule: ruleNumber, field: field })).to.deep.equal([]);
  });

  it("Should return errors when the given field is present but is empty or null", function () {
    expect(schemaObjectFieldCheck(schemaObjectWithNullRequiredField, { rule: ruleNumber, field: field })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: If a ${field} key is defined for a schema object, it must not be null or empty`,
        path: ["required"],
      },
    ]);
  });

  it("Should not return any errors when the given field is not present in the allOf format", function () {
    expect(schemaObjectFieldCheck(schemaAllOfObjectWithMissingRequiredField, { rule: ruleNumber, field: field })).to.deep.equal([]);
  });

  it("Should return errors when the given field is present but null in the allOf format", function () {
    expect(schemaObjectFieldCheck(schemaAllOfObjectWithNullRequiredField, { rule: ruleNumber, field: field })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: If a ${field} key is defined for a schema object, it must not be null or empty`,
        path: ["allOf", 0, "required"],
      },
    ]);
  });
});
