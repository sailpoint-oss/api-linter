import { describe, test, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import summaryCheck from "../summary-check.js";
const ruleNumber = "305";

const jsonPaths: OpenAPIV3.PathItemObject = {
  get: {
    tags: ["Access Profiles"],
    summary: "List Access Profiles",
    responses: {},
  },
  post: {
    tags: ["Access Profiles"],
    summary: "Create an Access Profile",
    responses: {},
  },
  put: {
    summary: "Put an Access Profile",
    responses: {},
  },
  patch: {
    summary: "Update an Access Profile",
    responses: {},
  },
  delete: {
    summary: "Delete an Access Profile",
    responses: {},
  },
};

const invalidAccessProfileSummaries: OpenAPIV3.PathItemObject = {
  get: {
    tags: ["Access Profiles"],
    operationId: "pathAccessProfiles",
    description:
      "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
    responses: {},
  },
  post: {
    tags: ["Access Profiles"],
    operationId: "createAccessProfile",
    description:
      "This API creates an Access Profile.\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API. In addition, a token with only ROLE_SUBADMIN or SOURCE_SUBADMIN authority must be associated with the Access Profile's Source.\nThe maximum supported length for the description field is 2000 characters. Longer descriptions will be preserved for existing access profiles, however, any new access profiles as well as any updates to existing descriptions will be limited to 2000 characters.",
    responses: {},
  },
};

describe("Path Summary Check Function", function () {
  test("Should not return any errors for valid summaries", function () {
    expect(
      summaryCheck(jsonPaths, {
        rule: ruleNumber,
      }),
    ).to.deep.equal([]);
  });

  test("Should return errors for empty summary", function () {
    expect(
      summaryCheck(invalidAccessProfileSummaries, {
        rule: ruleNumber,
      }),
    ).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: a brief summary must be provided and be no longer than 5 words`,
        path: ["get", "summary"],
      },
      {
        message: `Rule ${ruleNumber}: a brief summary must be provided and be no longer than 5 words`,
        path: ["post", "summary"],
      },
    ]);
  });
});
