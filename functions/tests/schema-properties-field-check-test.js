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

let multilevelSchemaObjectWithMissingExamples = {
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
    object: {
      type: "object",
      properties: {
        firstSecondLevelProperty: {
          type: "string",
          description: "This is a second level property",
          example: "This is a second level property example",
        },
        anotherObjectLevel: {
          type: "object",
          properties: {
            thirdLevelProperty: {
              type: "string",
              description: "third level property",
            },
          },
        },
      },
    },
  },
};

let superMultilevelSchemaObject = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "ID of the account activity itself",
      example: "2c9180835d2e5168015d32f890ca1581",
    },
    name: {
      type: "string",
      example: "2c9180835d2e5168015d32f890ca1581",
    },
    created: {
      type: "string",
      format: "date-time",
      example: "2017-07-11T18:45:37.098Z",
    },
    modified: {
      type: "string",
      format: "date-time",
      example: "2018-06-25T20:22:28.104Z",
    },
    completed: {
      type: "string",
      format: "date-time",
      example: "2018-10-19T13:49:37.385Z",
    },
    completionStatus: {
      nullable: true,
      type: "string",
      enum: ["SUCCESS", "FAILURE", "INCOMPLETE", "PENDING"],
    },
    type: {
      type: "string",
      example: "appRequest",
    },
    requesterIdentitySummary: {
      type: "object",
      nullable: true,
      properties: {
        id: {
          type: "string",
          description: "ID of this identity summary",
          example: "ff80818155fe8c080155fe8d925b0316",
        },
        name: {
          type: "string",
          description: "Human-readable display name of identity",
          example: "SailPoint Services",
        },
        identityId: {
          type: "string",
          description: "ID of the identity that this summary represents",
          example: "c15b9f5cca5a4e9599eaa0e64fa921bd",
        },
        completed: {
          type: "boolean",
          description:
            "Indicates if all access items for this summary have been decided on",
        },
      },
    },
    targetIdentitySummary: {
      type: "object",
      nullable: true,
      properties: {
        id: {
          type: "string",
          description: "ID of this identity summary",
          example: "ff80818155fe8c080155fe8d925b0316",
        },
        name: {
          type: "string",
          description: "Human-readable display name of identity",
          example: "SailPoint Services",
        },
        identityId: {
          type: "string",
          description: "ID of the identity that this summary represents",
          example: "c15b9f5cca5a4e9599eaa0e64fa921bd",
        },
        completed: {
          type: "boolean",
          description:
            "Indicates if all access items for this summary have been decided on",
        },
      },
    },
    errors: {
      type: "array",
      items: {
        type: "string",
      },
      example: [
        "sailpoint.connector.ConnectorException: java.lang.InterruptedException: Timeout waiting for response to message 0 from client 57a4ab97-ab3f-4aef-9fe2-0eaf15c73d26 after 60 seconds.",
      ],
    },
    warnings: {
      type: "array",
      items: {
        type: "string",
      },
      example: null,
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Item id",
            example: "2725138ee34949beb0d6cc982d2d4625",
          },
          name: {
            type: "string",
            description: "Human-readable display name of item",
          },
          requested: {
            type: "string",
            format: "date-time",
            description: "Date and time item was requested",
            example: "2017-07-11T18:45:37.098Z",
          },
          approvalStatus: {
            type: "string",
            enum: [
              "FINISHED",
              "REJECTED",
              "RETURNED",
              "EXPIRED",
              "PENDING",
              "CANCELED",
            ],
          },
          provisioningStatus: {
            type: "string",
            enum: [
              "PENDING",
              "FINISHED",
              "UNVERIFIABLE",
              "COMMITED",
              "FAILED",
              "RETRY",
            ],
            description: "Provisioning state of an account activity item",
          },
          requesterComment: {
            type: "object",
            nullable: true,
            properties: {
              commenterId: {
                type: "string",
                description: "Id of the identity making the comment",
                example: "2c918084660f45d6016617daa9210584",
              },
              commenterName: {
                type: "string",
                description:
                  "Human-readable display name of the identity making the comment",
                example: "Adam Kennedy",
              },
              body: {
                type: "string",
                description: "Content of the comment",
                example:
                  "Et quam massa maximus vivamus nisi ut urna tincidunt metus elementum erat.",
              },
              date: {
                type: "string",
                format: "date-time",
                description: "Date and time comment was made",
                example: "2017-07-11T18:45:37.098Z",
              },
            },
          },
          reviewerIdentitySummary: {
            type: "object",
            nullable: true,
            properties: {
              id: {
                type: "string",
                description: "ID of this identity summary",
                example: "ff80818155fe8c080155fe8d925b0316",
              },
              name: {
                type: "string",
                description: "Human-readable display name of identity",
                example: "SailPoint Services",
              },
              identityId: {
                type: "string",
                description: "ID of the identity that this summary represents",
                example: "c15b9f5cca5a4e9599eaa0e64fa921bd",
              },
              completed: {
                type: "boolean",
                description:
                  "Indicates if all access items for this summary have been decided on",
              },
            },
          },
          reviewerComment: {
            type: "object",
            nullable: true,
            properties: {
              commenterId: {
                type: "string",
                description: "Id of the identity making the comment",
                example: "2c918084660f45d6016617daa9210584",
              },
              commenterName: {
                type: "string",
                description:
                  "Human-readable display name of the identity making the comment",
                example: "Adam Kennedy",
              },
              body: {
                type: "string",
                description: "Content of the comment",
                example:
                  "Et quam massa maximus vivamus nisi ut urna tincidunt metus elementum erat.",
              },
              date: {
                type: "string",
                format: "date-time",
                description: "Date and time comment was made",
                example: "2017-07-11T18:45:37.098Z",
              },
            },
          },
          operation: {
            type: "string",
            enum: [
              "ADD",
              "CREATE",
              "MODIFY",
              "DELETE",
              "DISABLE",
              "ENABLE",
              "UNLOCK",
              "LOCK",
              "REMOVE",
            ],
            description: "Represents an operation in an account activity item",
          },
          attribute: {
            type: "string",
            description: "Attribute to which account activity applies",
            nullable: true,
            example: "detectedRoles",
          },
          value: {
            type: "string",
            description: "Value of attribute",
            nullable: true,
            example: "Treasury Analyst [AccessProfile-1529010191212]",
          },
          nativeIdentity: {
            nullable: true,
            type: "string",
            description:
              "Native identity in the target system to which the account activity applies",
            example: "Sandie.Camero",
          },
          sourceId: {
            type: "string",
            description: "Id of Source to which account activity applies",
            example: "2c91808363ef85290164000587130c0c",
          },
          accountRequestInfo: {
            type: "object",
            nullable: true,
            properties: {
              requestedObjectId: {
                type: "string",
                description: "Id of requested object",
                example: "2c91808563ef85690164001c31140c0c",
              },
              requestedObjectName: {
                type: "string",
                description: "Human-readable name of requested object",
                example: "Treasury Analyst",
              },
              requestedObjectType: {
                type: "string",
                enum: ["ACCESS_PROFILE", "ROLE"],
                description:
                  "Enum represented the currently supported requestable object types. Additional values may be added in the future without notice.",
                example: "ACCESS_PROFILE",
              },
            },
            description:
              "If an account activity item is associated with an access request, captures details of that request.",
          },
          clientMetadata: {
            nullable: true,
            type: "object",
            additionalProperties: {
              type: "string",
            },
            description:
              "Arbitrary key-value pairs, if any were included in the corresponding access request item",
          },
          removeDate: {
            nullable: true,
            type: "string",
            description:
              "The date the role or access profile is no longer assigned to the specified identity.",
            format: "date-time",
            example: "2020-07-11T00:00:00Z",
          },
        },
      },
    },
    executionStatus: {
      type: "string",
      enum: ["EXECUTING", "VERIFYING", "TERMINATED", "COMPLETED"],
    },
    clientMetadata: {
      type: "object",
      additionalProperties: {
        type: "string",
      },
      description:
        "Arbitrary key-value pairs, if any were included in the corresponding access request",
    },
    cancelable: {
      type: "boolean",
      description:
        "Whether the account activity can be canceled before completion",
    },
    cancelComment: {
      type: "object",
      nullable: true,
      properties: {
        commenterId: {
          type: "string",
          description: "Id of the identity making the comment",
          example: "2c918084660f45d6016617daa9210584",
        },
        commenterName: {
          type: "string",
          description:
            "Human-readable display name of the identity making the comment",
          example: "Adam Kennedy",
        },
        body: {
          type: "string",
          description: "Content of the comment",
          example:
            "Et quam massa maximus vivamus nisi ut urna tincidunt metus elementum erat.",
        },
        date: {
          type: "string",
          format: "date-time",
          description: "Date and time comment was made",
          example: "2017-07-11T18:45:37.098Z",
        },
      },
    },
  },
};

let itemArrayExample = {
  type: "object",
  properties: {
    requestedFor: {
      description:
        "A list of Identity IDs for whom the Access is requested. If it's a Revoke request, there can only be one Identity ID.",
      type: "array",
      items: {
        type: "string",
        example: "2c918084660f45d6016617daa9210584",
      },
    },
    requestType: {
      type: "string",
      enum: ["GRANT_ACCESS", "REVOKE_ACCESS"],
      description:
        "Access request type. Defaults to GRANT_ACCESS. REVOKE_ACCESS type can only have a single Identity ID in the requestedFor field. Currently REVOKE_ACCESS is not supported for entitlements.",
      example: "GRANT_ACCESS",
    },
    requestedItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["ACCESS_PROFILE", "ROLE", "ENTITLEMENT"],
            description: "The type of the item being requested.",
            example: "ACCESS_PROFILE",
          },
          id: {
            type: "string",
            description:
              "ID of Role, Access Profile or Entitlement being requested.",
            example: "2c9180835d2e5168015d32f890ca1581",
          },
          comment: {
            type: "string",
            description:
              "Comment provided by requester.\n* Comment is required when the request is of type Revoke Access.\n",
            example: "Requesting access profile for John Doe",
          },
          clientMetadata: {
            type: "object",
            additionalProperties: {
              type: "string",
              example: {
                requestedAppId: "2c91808f7892918f0178b78da4a305a1",
                requestedAppName: "test-app",
              },
            },
            example: {
              requestedAppName: "test-app",
              requestedAppId: "2c91808f7892918f0178b78da4a305a1",
            },
            description:
              "Arbitrary key-value pairs. They will never be processed by the IdentityNow system but will be returned on associated APIs such as /account-activities.",
          },
          removeDate: {
            type: "string",
            description:
              "The date the role or access profile is no longer assigned to the specified identity.\n* Specify a date in the future.\n* The current SLA for the deprovisioning is 24 hours.\n* This date can be modified to either extend or decrease the duration of access item assignments for the specified identity.\n* Currently it is not supported for entitlements.\n",
            format: "date-time",
            example: "2020-07-11T21:23:15.000Z",
          },
        },
        required: ["id", "type"],
      },
    },
    clientMetadata: {
      type: "object",
      additionalProperties: {
        type: "string",
        example: {
          requestedAppId: "2c91808f7892918f0178b78da4a305a1",
          requestedAppName: "test-app",
        },
      },
      example: {
        requestedAppId: "2c91808f7892918f0178b78da4a305a1",
        requestedAppName: "test-app",
      },
      description:
        "Arbitrary key-value pairs. They will never be processed by the IdentityNow system but will be returned on associated APIs such as /account-activities.",
    },
  },
  required: ["requestedFor", "requestedItems"],
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
          path: ["properties", "oldApproverName", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property newApproverName must have a example`,
          path: ["properties", "newApproverName", "example"],
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

  it("Should return errors for multi-level property objects", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The property thirdLevelProperty must have a example`,
          path: [
            "properties",
            "object",
            "properties",
            "anotherObjectLevel",
            "properties",
            "thirdLevelProperty",
            "example",
          ],
        },
      ],
      schemaPropertiesFieldCheck(multilevelSchemaObjectWithMissingExamples, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });

  it("Should return errors for super multi-level schema object", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The property completionStatus must have a example`,
          path: ["properties", "completionStatus", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property completed must have a example`,
          path: [
            "properties",
            "requesterIdentitySummary",
            "properties",
            "completed",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property completed must have a example`,
          path: [
            "properties",
            "targetIdentitySummary",
            "properties",
            "completed",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property warnings must have a example that is not null`,
          path: ["properties", "warnings", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property name must have a example`,
          path: [
            "properties",
            "items",
            "items",
            "properties",
            "name",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property approvalStatus must have a example`,
          path: [
            "properties",
            "items",
            "items",
            "properties",
            "approvalStatus",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property provisioningStatus must have a example`,
          path: [
            "properties",
            "items",
            "items",
            "properties",
            "provisioningStatus",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property completed must have a example`,
          path: [
            "properties",
            "items",
            "items",
            "properties",
            "reviewerIdentitySummary",
            "properties",
            "completed",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property operation must have a example`,
          path: [
            "properties",
            "items",
            "items",
            "properties",
            "operation",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property clientMetadata must have a example`,
          path: [
            "properties",
            "items",
            "items",
            "properties",
            "clientMetadata",
            "example",
          ],
        },
        {
          message: `Rule ${ruleNumber}: The property executionStatus must have a example`,
          path: ["properties", "executionStatus", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property clientMetadata must have a example`,
          path: ["properties", "clientMetadata", "example"],
        },
        {
          message: `Rule ${ruleNumber}: The property cancelable must have a example`,
          path: ["properties", "cancelable", "example"],
        },
      ],
      schemaPropertiesFieldCheck(superMultilevelSchemaObject, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });


  it("Should return no errors with item array example", function () {
    assert.deepEqual(
      [],
      schemaPropertiesFieldCheck(itemArrayExample, {
        rule: ruleNumber,
        field: "example",
      })
    );
  });
});
