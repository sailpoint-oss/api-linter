import { describe, test, expect } from "vitest";
import docusaurusVariableCheck from "../docusaurus-variable-check.js";

const ruleNumber = "406";

const cleanPathOperation = {
  get: {
    operationId: "getApprovals",
    summary: "Get approvals",
    description:
      "Gets a list of approvals. One of the following query parameters should be present: mine, approverId.",
    tags: ["Approvals"],
    parameters: [],
    responses: {
      "200": {
        description: "List of approvals",
      },
    },
  },
};

const pathWithDocusaurusVariableInDescription = {
  get: {
    operationId: "getApprovals",
    summary: "Get approvals",
    description:
      "Gets a list of approvals. The absence of all query parameters for non admins will default to mine=true (which is the equivalent of 'approverId=${your_identity_id}') while admins will default to mine=false.",
    tags: ["Approvals"],
    parameters: [],
    responses: {
      "200": {
        description: "List of approvals",
      },
    },
  },
};

const pathWithDocusaurusVariableInSummary = {
  get: {
    operationId: "getItem",
    summary: "Get ${resource_type}",
    description: "Gets an item.",
    tags: ["Items"],
    responses: {
      "200": {
        description: "The item",
      },
    },
  },
};

const pathWithMultipleDocusaurusVariables = {
  get: {
    operationId: "getApprovals",
    summary: "Get approvals",
    description:
      "Filter by approverId=${your_identity_id} or requesterId=${your_identity_id} to narrow results.",
    parameters: [
      {
        name: "approverId",
        in: "query",
        description: "The approver's ID, e.g. ${your_identity_id}",
        schema: { type: "string" },
      },
    ],
    responses: {},
  },
};

const schemaWithDocusaurusVariable = {
  type: "object",
  properties: {
    approverId: {
      type: "string",
      description:
        "The identity ID of the approver. Defaults to ${your_identity_id} when not provided.",
      example: "2c9180835d191a86015d28455b4a2329",
    },
  },
};

const schemaWithNestedDocusaurusVariable = {
  type: "object",
  properties: {
    filter: {
      type: "string",
      description: "Filter expression",
      example: "approverId eq ${your_identity_id}",
    },
  },
};

const cleanSchema = {
  type: "object",
  description: "An approval object",
  properties: {
    id: {
      type: "string",
      description: "The unique ID of the approval.",
      example: "2c9180835d191a86015d28455b4a2329",
    },
    name: {
      type: "string",
      description: "The name of the approval.",
      example: "Access Request Approval",
    },
  },
};

describe("Docusaurus Variable Check", () => {
  test("should not return any errors for a clean path operation", () => {
    const result = docusaurusVariableCheck(cleanPathOperation, {
      rule: ruleNumber,
    });
    expect(result).toBeUndefined();
  });

  test("should not return any errors for a clean schema", () => {
    const result = docusaurusVariableCheck(cleanSchema, { rule: ruleNumber });
    expect(result).toBeUndefined();
  });

  test("should return an error when a description contains ${...} syntax", () => {
    const result = docusaurusVariableCheck(
      pathWithDocusaurusVariableInDescription,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Docusaurus variable syntax is not allowed in API specs. Found: [\${your_identity_id}]. This syntax causes Docusaurus to crash when the variable is not defined.`,
      },
    ]);
  });

  test("should return an error when a summary contains ${...} syntax", () => {
    const result = docusaurusVariableCheck(
      pathWithDocusaurusVariableInSummary,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Docusaurus variable syntax is not allowed in API specs. Found: [\${resource_type}]. This syntax causes Docusaurus to crash when the variable is not defined.`,
      },
    ]);
  });

  test("should deduplicate repeated variable patterns in the error message", () => {
    const result = docusaurusVariableCheck(
      pathWithMultipleDocusaurusVariables,
      { rule: ruleNumber },
    );
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Docusaurus variable syntax is not allowed in API specs. Found: [\${your_identity_id}]. This syntax causes Docusaurus to crash when the variable is not defined.`,
      },
    ]);
  });

  test("should return an error when a schema property description contains ${...} syntax", () => {
    const result = docusaurusVariableCheck(schemaWithDocusaurusVariable, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Docusaurus variable syntax is not allowed in API specs. Found: [\${your_identity_id}]. This syntax causes Docusaurus to crash when the variable is not defined.`,
      },
    ]);
  });

  test("should return an error when a schema property example contains ${...} syntax", () => {
    const result = docusaurusVariableCheck(schemaWithNestedDocusaurusVariable, {
      rule: ruleNumber,
    });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: Docusaurus variable syntax is not allowed in API specs. Found: [\${your_identity_id}]. This syntax causes Docusaurus to crash when the variable is not defined.`,
      },
    ]);
  });
});
