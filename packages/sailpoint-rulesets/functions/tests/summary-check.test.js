import summaryCheck from "../summary-check.js";
const ruleNumber = 305;

const jsonPaths = {
  get: {
    tags: ["Access Profiles"],
    summary: "List Access Profiles",
  },
  post: {
    tags: ["Access Profiles"],
    summary: "Create an Access Profile",
  },
  put: {
    summary: "Put an Access Profile",
  },
  patch: {
    summary: "Update an Access Profile",
  },
  delete: {
    summary: "Delete an Access Profile",
  },
};

const invalidAccessProfileSummaries = {
  get: {
    tags: ["Access Profiles"],
    operationId: "pathAccessProfiles",
    description:
      "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
  },
  post: {
    tags: ["Access Profiles"],
    operationId: "createAccessProfile",
    description:
      "This API creates an Access Profile.\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API. In addition, a token with only ROLE_SUBADMIN or SOURCE_SUBADMIN authority must be associated with the Access Profile's Source.\nThe maximum supported length for the description field is 2000 characters. Longer descriptions will be preserved for existing access profiles, however, any new access profiles as well as any updates to existing descriptions will be limited to 2000 characters.",
  },
};

describe("Path Summary Check Function", function () {
  it("Should not return any errors for valid summaries", function () {
    expect(summaryCheck(jsonPaths, {
      rule: ruleNumber,
    })).to.deep.equal([]);
  });

  it("Should return errors for empty summary", function () {
    expect(summaryCheck(invalidAccessProfileSummaries, {
      rule: ruleNumber,
    })).to.deep.equal([
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
