import operationCheck from "../path-operation-check.js";

const ruleNumber = 400;

let jsonPaths = {
  get: {
    tags: ["Access Profiles"],
    summary: "List Access Profiles",
    operationId: "listAccessProfiles",
    description:
      "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
    parameters: [
      {
        in: "query",
        name: "for-subadmin",
        schema: { type: "string" },
        description:
          "If provided, filters the returned list according to what is visible to the indicated ROLE_SUBADMIN or SOURCE_SUBADMIN Identity. The value of the parameter is either an Identity ID, or the special value **me**, which is shorthand for the calling Identity's ID.\n\nA 400 Bad Request error is returned if the **for-subadmin** parameter is specified for an Identity that is not a subadmin.",
        example: "8c190e6787aa4ed9a90bd9d5344523fb",
        required: false,
      },
      {
        in: "query",
        name: "limit",
        description:
          "Note that for this API the maximum value for limit is 50.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
        required: false,
        example: 50,
        schema: {
          type: "integer",
          format: "int32",
          minimum: 0,
          maximum: 50,
          default: 50,
        },
      },
      {
        in: "query",
        name: "offset",
        description:
          "Offset into the full result set. Usually specified with *limit* to paginate through the results.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
        required: false,
        example: 0,
        schema: { type: "integer", format: "int32", minimum: 0, default: 0 },
      },
      {
        in: "query",
        name: "count",
        description:
          "If *true* it will populate the *X-Total-Count* response header with the number of results that would be returned if *limit* and *offset* were ignored.\n\nSince requesting a total count can have a performance impact, it is recommended not to send **count=true** if that value will not be used.\n\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
        required: false,
        example: true,
        schema: { type: "boolean", default: false },
      },
      {
        in: "query",
        name: "filters",
        schema: { type: "string" },
        description:
          "Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)\n\nFiltering is supported for the following fields and operators:\n\n**id**: *eq, in*\n\n**name**: *eq, sw*\n\n**created, modified**: *gt, lt, ge, le*\n\n**owner.id**: *eq, in*\n\n**requestable**: *eq*\n\n**source.id**: *eq, in*",
        example: 'name eq "SailPoint Support"',
        required: false,
      },
      {
        in: "query",
        name: "sorters",
        schema: { type: "string", format: "comma-separated" },
        description:
          "Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)\n\nSorting is supported for the following fields: **name, created, modified**",
        example: "name,-modified",
        required: false,
      },
      {
        in: "query",
        name: "for-segment-ids",
        schema: { type: "string", format: "comma-separated" },
        description:
          "If present and not empty, additionally filters Access Profiles to those which are assigned to the Segment(s) with the specified IDs.\n\nIf segmentation is currently unavailable, specifying this parameter results in an error.",
        example:
          "0b5c9f25-83c6-4762-9073-e38f7bb2ae26,2e8d8180-24bc-4d21-91c6-7affdb473b0d",
        required: false,
      },
      {
        in: "query",
        name: "include-unsegmented",
        schema: { type: "boolean", default: true },
        description:
          "Whether or not the response list should contain unsegmented Access Profiles. If *for-segment-ids* is absent or empty, specifying *include-unsegmented* as false results in an error.",
        example: false,
        required: false,
      },
    ],
    responses: {
      200: {
        description: "List of Access Profiles",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "The ID of the Access Profile",
                    example: "2c91808a7190d06e01719938fcd20792",
                    readOnly: true,
                  },
                  name: {
                    type: "string",
                    description: "Name of the Access Profile",
                    example: "Employee-database-read-write",
                  },
                  description: {
                    type: "string",
                    nullable: true,
                    description: "Information about the Access Profile",
                    example:
                      "Collection of entitlements to read/write the employee database",
                  },
                  created: {
                    type: "string",
                    description: "Date the Access Profile was created",
                    format: "date-time",
                    example: "2021-03-01T22:32:58.104Z",
                    readOnly: true,
                  },
                  modified: {
                    type: "string",
                    description: "Date the Access Profile was last modified.",
                    format: "date-time",
                    example: "2021-03-02T20:22:28.104Z",
                    readOnly: true,
                  },
                  enabled: {
                    type: "boolean",
                    description:
                      "Whether the Access Profile is enabled. If the Access Profile is enabled then you must include at least one Entitlement.",
                    example: true,
                  },
                  owner: {
                    type: "object",
                    description: "The owner of this object.",
                    properties: {
                      type: {
                        type: "string",
                        enum: [
                          "ACCOUNT_CORRELATION_CONFIG",
                          "ACCESS_PROFILE",
                          "ACCESS_REQUEST_APPROVAL",
                          "ACCOUNT",
                          "APPLICATION",
                          "CAMPAIGN",
                          "CAMPAIGN_FILTER",
                          "CERTIFICATION",
                          "CLUSTER",
                          "CONNECTOR_SCHEMA",
                          "ENTITLEMENT",
                          "GOVERNANCE_GROUP",
                          "IDENTITY",
                          "IDENTITY_PROFILE",
                          "IDENTITY_REQUEST",
                          "LIFECYCLE_STATE",
                          "PASSWORD_POLICY",
                          "ROLE",
                          "RULE",
                          "SOD_POLICY",
                          "SOURCE",
                          "TAG_CATEGORY",
                          "TASK_RESULT",
                          "REPORT_RESULT",
                          "SOD_VIOLATION",
                          "ACCOUNT_ACTIVITY",
                        ],
                        description:
                          "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                        example: "IDENTITY",
                      },
                      id: {
                        type: "string",
                        description: "Identity id",
                        example: "2c9180a46faadee4016fb4e018c20639",
                      },
                      name: {
                        type: "string",
                        description:
                          "Human-readable display name of the owner. It may be left null or omitted in a POST or PATCH. If set, it must match the current value of the owner's display name, otherwise a 400 Bad Request error will result.",
                        example: "support",
                      },
                    },
                  },
                  source: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        description:
                          "The ID of the Source with with which the Access Profile is associated",
                        example: "2c91809773dee3610173fdb0b6061ef4",
                      },
                      type: {
                        type: "string",
                        enum: ["SOURCE"],
                        description:
                          "The type of the Source, will always be SOURCE",
                        example: "SOURCE",
                      },
                      name: {
                        type: "string",
                        description:
                          "The display name of the associated Source",
                        example: "ODS-AD-SOURCE",
                      },
                    },
                  },
                  entitlements: {
                    type: "array",
                    description:
                      "A list of entitlements associated with the Access Profile. If enabled is false this is allowed to be empty otherwise it needs to contain at least one Entitlement.",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "The ID of the Entitlement",
                          example: "2c91809773dee32014e13e122092014e",
                        },
                        type: {
                          type: "string",
                          enum: ["ENTITLEMENT"],
                          description:
                            "The type of the Entitlement, will always be ENTITLEMENT",
                          example: "ENTITLEMENT",
                        },
                        name: {
                          type: "string",
                          description: "The display name of the Entitlement",
                          example:
                            "CN=entitlement.490efde5,OU=OrgCo,OU=ServiceDept,DC=HQAD,DC=local",
                        },
                      },
                    },
                  },
                  requestable: {
                    type: "boolean",
                    description:
                      "Whether the Access Profile is requestable via access request. Currently, making an Access Profile non-requestable is only supported  for customers enabled with the new Request Center. Otherwise, attempting to create an Access Profile with a value  **false** in this field results in a 400 error.",
                    example: true,
                  },
                  accessRequestConfig: {
                    type: "object",
                    properties: {
                      commentsRequired: {
                        type: "boolean",
                        description:
                          "Whether the requester of the containing object must provide comments justifying the request",
                        example: true,
                      },
                      denialCommentsRequired: {
                        type: "boolean",
                        description:
                          "Whether an approver must provide comments when denying the request",
                        example: true,
                      },
                      approvalSchemes: {
                        type: "array",
                        description:
                          "List describing the steps in approving the request",
                        items: {
                          type: "object",
                          properties: {
                            approverType: {
                              type: "string",
                              enum: [
                                "APP_OWNER",
                                "OWNER",
                                "SOURCE_OWNER",
                                "MANAGER",
                                "GOVERNANCE_GROUP",
                              ],
                              description:
                                "Describes the individual or group that is responsible for an approval step. Values are as follows.\n**APP_OWNER**: The owner of the Application\n\n**OWNER**: Owner of the associated Access Profile or Role\n\n**SOURCE_OWNER**: Owner of the Source associated with an Access Profile\n\n**MANAGER**: Manager of the Identity making the request\n\n**GOVERNANCE_GROUP**: A Governance Group, the ID of which is specified by the **approverId** field",
                              example: "GOVERNANCE_GROUP",
                            },
                            approverId: {
                              type: "string",
                              nullable: true,
                              description:
                                "Id of the specific approver, used only when approverType is GOVERNANCE_GROUP",
                              example: "46c79819-a69f-49a2-becb-12c971ae66c6",
                            },
                          },
                        },
                      },
                    },
                  },
                  revocationRequestConfig: {
                    type: "object",
                    properties: {
                      approvalSchemes: {
                        type: "array",
                        description:
                          "List describing the steps in approving the revocation request",
                        items: {
                          type: "object",
                          properties: {
                            approverType: {
                              type: "string",
                              enum: [
                                "APP_OWNER",
                                "OWNER",
                                "SOURCE_OWNER",
                                "MANAGER",
                                "GOVERNANCE_GROUP",
                              ],
                              description:
                                "Describes the individual or group that is responsible for an approval step. Values are as follows.\n**APP_OWNER**: The owner of the Application\n\n**OWNER**: Owner of the associated Access Profile or Role\n\n**SOURCE_OWNER**: Owner of the Source associated with an Access Profile\n\n**MANAGER**: Manager of the Identity making the request\n\n**GOVERNANCE_GROUP**: A Governance Group, the ID of which is specified by the **approverId** field",
                              example: "GOVERNANCE_GROUP",
                            },
                            approverId: {
                              type: "string",
                              nullable: true,
                              description:
                                "Id of the specific approver, used only when approverType is GOVERNANCE_GROUP",
                              example: "46c79819-a69f-49a2-becb-12c971ae66c6",
                            },
                          },
                        },
                      },
                    },
                  },
                  segments: {
                    type: "array",
                    nullable: true,
                    items: { type: "string" },
                    description:
                      "List of IDs of segments, if any, to which this Access Profile is assigned.",
                    example: [
                      "f7b1b8a3-5fed-4fd4-ad29-82014e137e19",
                      "29cb6c06-1da8-43ea-8be4-b3125f248f2a",
                    ],
                  },
                  provisioningCriteria: {
                    type: "object",
                    nullable: true,
                    description:
                      "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                    properties: {
                      operation: {
                        type: "string",
                        enum: [
                          "EQUALS",
                          "NOT_EQUALS",
                          "CONTAINS",
                          "HAS",
                          "AND",
                          "OR",
                        ],
                        description:
                          "Supported operations on ProvisioningCriteria",
                        example: "EQUALS",
                      },
                      attribute: {
                        type: "string",
                        description:
                          "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                        example: "email",
                        nullable: true,
                      },
                      value: {
                        type: "string",
                        nullable: true,
                        description:
                          "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                        example: "carlee.cert1c9f9b6fd@mailinator.com",
                      },
                      children: {
                        type: "array",
                        items: {
                          type: "object",
                          description:
                            "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                          properties: {
                            operation: {
                              type: "string",
                              enum: [
                                "EQUALS",
                                "NOT_EQUALS",
                                "CONTAINS",
                                "HAS",
                                "AND",
                                "OR",
                              ],
                              description:
                                "Supported operations on ProvisioningCriteria",
                              example: "EQUALS",
                            },
                            attribute: {
                              type: "string",
                              description:
                                "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                              example: "email",
                              nullable: true,
                            },
                            value: {
                              type: "string",
                              nullable: true,
                              description:
                                "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                              example: "carlee.cert1c9f9b6fd@mailinator.com",
                            },
                            children: {
                              type: "array",
                              items: {
                                type: "object",
                                description:
                                  "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                                properties: {
                                  operation: {
                                    type: "string",
                                    enum: [
                                      "EQUALS",
                                      "NOT_EQUALS",
                                      "CONTAINS",
                                      "HAS",
                                      "AND",
                                      "OR",
                                    ],
                                    description:
                                      "Supported operations on ProvisioningCriteria",
                                    example: "EQUALS",
                                  },
                                  attribute: {
                                    type: "string",
                                    description:
                                      "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                                    example: "email",
                                    nullable: true,
                                  },
                                  value: {
                                    type: "string",
                                    description:
                                      "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                                    example:
                                      "carlee.cert1c9f9b6fd@mailinator.com",
                                  },
                                },
                              },
                              nullable: true,
                              description:
                                "Array of child criteria. Required if the operation is AND or OR, otherwise it must be left null. A maximum of three levels of criteria are supported, including leaf nodes.",
                              example: null,
                            },
                          },
                        },
                        nullable: true,
                        description:
                          "Array of child criteria. Required if the operation is AND or OR, otherwise it must be left null. A maximum of three levels of criteria are supported, including leaf nodes.",
                        example: null,
                      },
                    },
                  },
                },
                required: ["owner", "name", "source"],
              },
            },
          },
        },
      },
      400: {
        description: "Client Error - Returned if the request body is invalid.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                detailCode: {
                  type: "string",
                  description:
                    "Fine-grained error code providing more detail of the error.",
                  example: "400.1 Bad Request Content",
                },
                trackingId: {
                  type: "string",
                  description: "Unique tracking id for the error.",
                  example: "e7eab60924f64aa284175b9fa3309599",
                },
                messages: {
                  type: "array",
                  description: "Generic localized reason for error",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
                causes: {
                  type: "array",
                  description:
                    "Plain-text descriptive reasons to provide additional detail to the text provided in the messages field",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description:
          "Unauthorized - Returned if there is no authorization header, or if the JWT token is expired.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  description: "A message describing the error",
                  example: "JWT validation failed: JWT is expired",
                },
              },
            },
          },
        },
      },
      403: {
        description:
          "Forbidden - Returned if the user you are running as, doesn't have access to this end-point.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                detailCode: {
                  type: "string",
                  description:
                    "Fine-grained error code providing more detail of the error.",
                  example: "400.1 Bad Request Content",
                },
                trackingId: {
                  type: "string",
                  description: "Unique tracking id for the error.",
                  example: "e7eab60924f64aa284175b9fa3309599",
                },
                messages: {
                  type: "array",
                  description: "Generic localized reason for error",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
                causes: {
                  type: "array",
                  description:
                    "Plain-text descriptive reasons to provide additional detail to the text provided in the messages field",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
              },
            },
            examples: {
              403: {
                summary: "An example of a 403 response object",
                value: {
                  detailCode: "403 Forbidden",
                  trackingId: "b21b1f7ce4da4d639f2c62a57171b427",
                  messages: [
                    {
                      locale: "en-US",
                      localeOrigin: "DEFAULT",
                      text: "The server understood the request but refuses to authorize it.",
                    },
                  ],
                },
              },
            },
          },
        },
      },
      429: {
        description:
          "Too Many Requests - Returned in response to too many requests in a given period of time - rate limited. The Retry-After header in the response includes how long to wait before trying again.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  description: "A message describing the error",
                  example: " Rate Limit Exceeded ",
                },
              },
            },
          },
        },
      },
      500: {
        description:
          "Internal Server Error - Returned if there is an unexpected error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                detailCode: {
                  type: "string",
                  description:
                    "Fine-grained error code providing more detail of the error.",
                  example: "400.1 Bad Request Content",
                },
                trackingId: {
                  type: "string",
                  description: "Unique tracking id for the error.",
                  example: "e7eab60924f64aa284175b9fa3309599",
                },
                messages: {
                  type: "array",
                  description: "Generic localized reason for error",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
                causes: {
                  type: "array",
                  description:
                    "Plain-text descriptive reasons to provide additional detail to the text provided in the messages field",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
              },
            },
            examples: {
              500: {
                summary: "An example of a 500 response object",
                value: {
                  detailCode: "500.0 Internal Fault",
                  trackingId: "b21b1f7ce4da4d639f2c62a57171b427",
                  messages: [
                    {
                      locale: "en-US",
                      localeOrigin: "DEFAULT",
                      text: "An internal fault occurred.",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    security: [{ oauth2: ["idn:access-profile:read"] }],
  },
  post: {
    tags: ["Access Profiles"],
    summary: "Create an Access Profile",
    operationId: "createAccessProfile",
    description:
      "This API creates an Access Profile.\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API. In addition, a token with only ROLE_SUBADMIN or SOURCE_SUBADMIN authority must be associated with the Access Profile's Source.\nThe maximum supported length for the description field is 2000 characters. Longer descriptions will be preserved for existing access profiles, however, any new access profiles as well as any updates to existing descriptions will be limited to 2000 characters.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "The ID of the Access Profile",
                example: "2c91808a7190d06e01719938fcd20792",
                readOnly: true,
              },
              name: {
                type: "string",
                description: "Name of the Access Profile",
                example: "Employee-database-read-write",
              },
              description: {
                type: "string",
                nullable: true,
                description: "Information about the Access Profile",
                example:
                  "Collection of entitlements to read/write the employee database",
              },
              created: {
                type: "string",
                description: "Date the Access Profile was created",
                format: "date-time",
                example: "2021-03-01T22:32:58.104Z",
                readOnly: true,
              },
              modified: {
                type: "string",
                description: "Date the Access Profile was last modified.",
                format: "date-time",
                example: "2021-03-02T20:22:28.104Z",
                readOnly: true,
              },
              enabled: {
                type: "boolean",
                description:
                  "Whether the Access Profile is enabled. If the Access Profile is enabled then you must include at least one Entitlement.",
                example: true,
              },
              owner: {
                type: "object",
                description: "The owner of this object.",
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "ACCOUNT_CORRELATION_CONFIG",
                      "ACCESS_PROFILE",
                      "ACCESS_REQUEST_APPROVAL",
                      "ACCOUNT",
                      "APPLICATION",
                      "CAMPAIGN",
                      "CAMPAIGN_FILTER",
                      "CERTIFICATION",
                      "CLUSTER",
                      "CONNECTOR_SCHEMA",
                      "ENTITLEMENT",
                      "GOVERNANCE_GROUP",
                      "IDENTITY",
                      "IDENTITY_PROFILE",
                      "IDENTITY_REQUEST",
                      "LIFECYCLE_STATE",
                      "PASSWORD_POLICY",
                      "ROLE",
                      "RULE",
                      "SOD_POLICY",
                      "SOURCE",
                      "TAG_CATEGORY",
                      "TASK_RESULT",
                      "REPORT_RESULT",
                      "SOD_VIOLATION",
                      "ACCOUNT_ACTIVITY",
                    ],
                    description:
                      "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                    example: "IDENTITY",
                  },
                  id: {
                    type: "string",
                    description: "Identity id",
                    example: "2c9180a46faadee4016fb4e018c20639",
                  },
                  name: {
                    type: "string",
                    description:
                      "Human-readable display name of the owner. It may be left null or omitted in a POST or PATCH. If set, it must match the current value of the owner's display name, otherwise a 400 Bad Request error will result.",
                    example: "support",
                  },
                },
              },
              source: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description:
                      "The ID of the Source with with which the Access Profile is associated",
                    example: "2c91809773dee3610173fdb0b6061ef4",
                  },
                  type: {
                    type: "string",
                    enum: ["SOURCE"],
                    description:
                      "The type of the Source, will always be SOURCE",
                    example: "SOURCE",
                  },
                  name: {
                    type: "string",
                    description: "The display name of the associated Source",
                    example: "ODS-AD-SOURCE",
                  },
                },
              },
              entitlements: {
                type: "array",
                description:
                  "A list of entitlements associated with the Access Profile. If enabled is false this is allowed to be empty otherwise it needs to contain at least one Entitlement.",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "The ID of the Entitlement",
                      example: "2c91809773dee32014e13e122092014e",
                    },
                    type: {
                      type: "string",
                      enum: ["ENTITLEMENT"],
                      description:
                        "The type of the Entitlement, will always be ENTITLEMENT",
                      example: "ENTITLEMENT",
                    },
                    name: {
                      type: "string",
                      description: "The display name of the Entitlement",
                      example:
                        "CN=entitlement.490efde5,OU=OrgCo,OU=ServiceDept,DC=HQAD,DC=local",
                    },
                  },
                },
              },
              requestable: {
                type: "boolean",
                description:
                  "Whether the Access Profile is requestable via access request. Currently, making an Access Profile non-requestable is only supported  for customers enabled with the new Request Center. Otherwise, attempting to create an Access Profile with a value  **false** in this field results in a 400 error.",
                example: true,
              },
              accessRequestConfig: {
                type: "object",
                properties: {
                  commentsRequired: {
                    type: "boolean",
                    description:
                      "Whether the requester of the containing object must provide comments justifying the request",
                    example: true,
                  },
                  denialCommentsRequired: {
                    type: "boolean",
                    description:
                      "Whether an approver must provide comments when denying the request",
                    example: true,
                  },
                  approvalSchemes: {
                    type: "array",
                    description:
                      "List describing the steps in approving the request",
                    items: {
                      type: "object",
                      properties: {
                        approverType: {
                          type: "string",
                          enum: [
                            "APP_OWNER",
                            "OWNER",
                            "SOURCE_OWNER",
                            "MANAGER",
                            "GOVERNANCE_GROUP",
                          ],
                          description:
                            "Describes the individual or group that is responsible for an approval step. Values are as follows.\n**APP_OWNER**: The owner of the Application\n\n**OWNER**: Owner of the associated Access Profile or Role\n\n**SOURCE_OWNER**: Owner of the Source associated with an Access Profile\n\n**MANAGER**: Manager of the Identity making the request\n\n**GOVERNANCE_GROUP**: A Governance Group, the ID of which is specified by the **approverId** field",
                          example: "GOVERNANCE_GROUP",
                        },
                        approverId: {
                          type: "string",
                          nullable: true,
                          description:
                            "Id of the specific approver, used only when approverType is GOVERNANCE_GROUP",
                          example: "46c79819-a69f-49a2-becb-12c971ae66c6",
                        },
                      },
                    },
                  },
                },
              },
              revocationRequestConfig: {
                type: "object",
                properties: {
                  approvalSchemes: {
                    type: "array",
                    description:
                      "List describing the steps in approving the revocation request",
                    items: {
                      type: "object",
                      properties: {
                        approverType: {
                          type: "string",
                          enum: [
                            "APP_OWNER",
                            "OWNER",
                            "SOURCE_OWNER",
                            "MANAGER",
                            "GOVERNANCE_GROUP",
                          ],
                          description:
                            "Describes the individual or group that is responsible for an approval step. Values are as follows.\n**APP_OWNER**: The owner of the Application\n\n**OWNER**: Owner of the associated Access Profile or Role\n\n**SOURCE_OWNER**: Owner of the Source associated with an Access Profile\n\n**MANAGER**: Manager of the Identity making the request\n\n**GOVERNANCE_GROUP**: A Governance Group, the ID of which is specified by the **approverId** field",
                          example: "GOVERNANCE_GROUP",
                        },
                        approverId: {
                          type: "string",
                          nullable: true,
                          description:
                            "Id of the specific approver, used only when approverType is GOVERNANCE_GROUP",
                          example: "46c79819-a69f-49a2-becb-12c971ae66c6",
                        },
                      },
                    },
                  },
                },
              },
              segments: {
                type: "array",
                nullable: true,
                items: { type: "string" },
                description:
                  "List of IDs of segments, if any, to which this Access Profile is assigned.",
                example: [
                  "f7b1b8a3-5fed-4fd4-ad29-82014e137e19",
                  "29cb6c06-1da8-43ea-8be4-b3125f248f2a",
                ],
              },
              provisioningCriteria: {
                type: "object",
                nullable: true,
                description:
                  "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                properties: {
                  operation: {
                    type: "string",
                    enum: [
                      "EQUALS",
                      "NOT_EQUALS",
                      "CONTAINS",
                      "HAS",
                      "AND",
                      "OR",
                    ],
                    description: "Supported operations on ProvisioningCriteria",
                    example: "EQUALS",
                  },
                  attribute: {
                    type: "string",
                    description:
                      "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                    example: "email",
                    nullable: true,
                  },
                  value: {
                    type: "string",
                    nullable: true,
                    description:
                      "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                    example: "carlee.cert1c9f9b6fd@mailinator.com",
                  },
                  children: {
                    type: "array",
                    items: {
                      type: "object",
                      description:
                        "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                      properties: {
                        operation: {
                          type: "string",
                          enum: [
                            "EQUALS",
                            "NOT_EQUALS",
                            "CONTAINS",
                            "HAS",
                            "AND",
                            "OR",
                          ],
                          description:
                            "Supported operations on ProvisioningCriteria",
                          example: "EQUALS",
                        },
                        attribute: {
                          type: "string",
                          description:
                            "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                          example: "email",
                          nullable: true,
                        },
                        value: {
                          type: "string",
                          nullable: true,
                          description:
                            "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                          example: "carlee.cert1c9f9b6fd@mailinator.com",
                        },
                        children: {
                          type: "array",
                          items: {
                            type: "object",
                            description:
                              "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                            properties: {
                              operation: {
                                type: "string",
                                enum: [
                                  "EQUALS",
                                  "NOT_EQUALS",
                                  "CONTAINS",
                                  "HAS",
                                  "AND",
                                  "OR",
                                ],
                                description:
                                  "Supported operations on ProvisioningCriteria",
                                example: "EQUALS",
                              },
                              attribute: {
                                type: "string",
                                description:
                                  "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                                example: "email",
                                nullable: true,
                              },
                              value: {
                                type: "string",
                                description:
                                  "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                                example: "carlee.cert1c9f9b6fd@mailinator.com",
                              },
                            },
                          },
                          nullable: true,
                          description:
                            "Array of child criteria. Required if the operation is AND or OR, otherwise it must be left null. A maximum of three levels of criteria are supported, including leaf nodes.",
                          example: null,
                        },
                      },
                    },
                    nullable: true,
                    description:
                      "Array of child criteria. Required if the operation is AND or OR, otherwise it must be left null. A maximum of three levels of criteria are supported, including leaf nodes.",
                    example: null,
                  },
                },
              },
            },
            required: ["owner", "name", "source"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "Access Profile created",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The ID of the Access Profile",
                  example: "2c91808a7190d06e01719938fcd20792",
                  readOnly: true,
                },
                name: {
                  type: "string",
                  description: "Name of the Access Profile",
                  example: "Employee-database-read-write",
                },
                description: {
                  type: "string",
                  nullable: true,
                  description: "Information about the Access Profile",
                  example:
                    "Collection of entitlements to read/write the employee database",
                },
                created: {
                  type: "string",
                  description: "Date the Access Profile was created",
                  format: "date-time",
                  example: "2021-03-01T22:32:58.104Z",
                  readOnly: true,
                },
                modified: {
                  type: "string",
                  description: "Date the Access Profile was last modified.",
                  format: "date-time",
                  example: "2021-03-02T20:22:28.104Z",
                  readOnly: true,
                },
                enabled: {
                  type: "boolean",
                  description:
                    "Whether the Access Profile is enabled. If the Access Profile is enabled then you must include at least one Entitlement.",
                  example: true,
                },
                owner: {
                  type: "object",
                  description: "The owner of this object.",
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "ACCOUNT_CORRELATION_CONFIG",
                        "ACCESS_PROFILE",
                        "ACCESS_REQUEST_APPROVAL",
                        "ACCOUNT",
                        "APPLICATION",
                        "CAMPAIGN",
                        "CAMPAIGN_FILTER",
                        "CERTIFICATION",
                        "CLUSTER",
                        "CONNECTOR_SCHEMA",
                        "ENTITLEMENT",
                        "GOVERNANCE_GROUP",
                        "IDENTITY",
                        "IDENTITY_PROFILE",
                        "IDENTITY_REQUEST",
                        "LIFECYCLE_STATE",
                        "PASSWORD_POLICY",
                        "ROLE",
                        "RULE",
                        "SOD_POLICY",
                        "SOURCE",
                        "TAG_CATEGORY",
                        "TASK_RESULT",
                        "REPORT_RESULT",
                        "SOD_VIOLATION",
                        "ACCOUNT_ACTIVITY",
                      ],
                      description:
                        "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                      example: "IDENTITY",
                    },
                    id: {
                      type: "string",
                      description: "Identity id",
                      example: "2c9180a46faadee4016fb4e018c20639",
                    },
                    name: {
                      type: "string",
                      description:
                        "Human-readable display name of the owner. It may be left null or omitted in a POST or PATCH. If set, it must match the current value of the owner's display name, otherwise a 400 Bad Request error will result.",
                      example: "support",
                    },
                  },
                },
                source: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description:
                        "The ID of the Source with with which the Access Profile is associated",
                      example: "2c91809773dee3610173fdb0b6061ef4",
                    },
                    type: {
                      type: "string",
                      enum: ["SOURCE"],
                      description:
                        "The type of the Source, will always be SOURCE",
                      example: "SOURCE",
                    },
                    name: {
                      type: "string",
                      description: "The display name of the associated Source",
                      example: "ODS-AD-SOURCE",
                    },
                  },
                },
                entitlements: {
                  type: "array",
                  description:
                    "A list of entitlements associated with the Access Profile. If enabled is false this is allowed to be empty otherwise it needs to contain at least one Entitlement.",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        description: "The ID of the Entitlement",
                        example: "2c91809773dee32014e13e122092014e",
                      },
                      type: {
                        type: "string",
                        enum: ["ENTITLEMENT"],
                        description:
                          "The type of the Entitlement, will always be ENTITLEMENT",
                        example: "ENTITLEMENT",
                      },
                      name: {
                        type: "string",
                        description: "The display name of the Entitlement",
                        example:
                          "CN=entitlement.490efde5,OU=OrgCo,OU=ServiceDept,DC=HQAD,DC=local",
                      },
                    },
                  },
                },
                requestable: {
                  type: "boolean",
                  description:
                    "Whether the Access Profile is requestable via access request. Currently, making an Access Profile non-requestable is only supported  for customers enabled with the new Request Center. Otherwise, attempting to create an Access Profile with a value  **false** in this field results in a 400 error.",
                  example: true,
                },
                accessRequestConfig: {
                  type: "object",
                  properties: {
                    commentsRequired: {
                      type: "boolean",
                      description:
                        "Whether the requester of the containing object must provide comments justifying the request",
                      example: true,
                    },
                    denialCommentsRequired: {
                      type: "boolean",
                      description:
                        "Whether an approver must provide comments when denying the request",
                      example: true,
                    },
                    approvalSchemes: {
                      type: "array",
                      description:
                        "List describing the steps in approving the request",
                      items: {
                        type: "object",
                        properties: {
                          approverType: {
                            type: "string",
                            enum: [
                              "APP_OWNER",
                              "OWNER",
                              "SOURCE_OWNER",
                              "MANAGER",
                              "GOVERNANCE_GROUP",
                            ],
                            description:
                              "Describes the individual or group that is responsible for an approval step. Values are as follows.\n**APP_OWNER**: The owner of the Application\n\n**OWNER**: Owner of the associated Access Profile or Role\n\n**SOURCE_OWNER**: Owner of the Source associated with an Access Profile\n\n**MANAGER**: Manager of the Identity making the request\n\n**GOVERNANCE_GROUP**: A Governance Group, the ID of which is specified by the **approverId** field",
                            example: "GOVERNANCE_GROUP",
                          },
                          approverId: {
                            type: "string",
                            nullable: true,
                            description:
                              "Id of the specific approver, used only when approverType is GOVERNANCE_GROUP",
                            example: "46c79819-a69f-49a2-becb-12c971ae66c6",
                          },
                        },
                      },
                    },
                  },
                },
                revocationRequestConfig: {
                  type: "object",
                  properties: {
                    approvalSchemes: {
                      type: "array",
                      description:
                        "List describing the steps in approving the revocation request",
                      items: {
                        type: "object",
                        properties: {
                          approverType: {
                            type: "string",
                            enum: [
                              "APP_OWNER",
                              "OWNER",
                              "SOURCE_OWNER",
                              "MANAGER",
                              "GOVERNANCE_GROUP",
                            ],
                            description:
                              "Describes the individual or group that is responsible for an approval step. Values are as follows.\n**APP_OWNER**: The owner of the Application\n\n**OWNER**: Owner of the associated Access Profile or Role\n\n**SOURCE_OWNER**: Owner of the Source associated with an Access Profile\n\n**MANAGER**: Manager of the Identity making the request\n\n**GOVERNANCE_GROUP**: A Governance Group, the ID of which is specified by the **approverId** field",
                            example: "GOVERNANCE_GROUP",
                          },
                          approverId: {
                            type: "string",
                            nullable: true,
                            description:
                              "Id of the specific approver, used only when approverType is GOVERNANCE_GROUP",
                            example: "46c79819-a69f-49a2-becb-12c971ae66c6",
                          },
                        },
                      },
                    },
                  },
                },
                segments: {
                  type: "array",
                  nullable: true,
                  items: { type: "string" },
                  description:
                    "List of IDs of segments, if any, to which this Access Profile is assigned.",
                  example: [
                    "f7b1b8a3-5fed-4fd4-ad29-82014e137e19",
                    "29cb6c06-1da8-43ea-8be4-b3125f248f2a",
                  ],
                },
                provisioningCriteria: {
                  type: "object",
                  nullable: true,
                  description:
                    "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                  properties: {
                    operation: {
                      type: "string",
                      enum: [
                        "EQUALS",
                        "NOT_EQUALS",
                        "CONTAINS",
                        "HAS",
                        "AND",
                        "OR",
                      ],
                      description:
                        "Supported operations on ProvisioningCriteria",
                      example: "EQUALS",
                    },
                    attribute: {
                      type: "string",
                      description:
                        "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                      example: "email",
                      nullable: true,
                    },
                    value: {
                      type: "string",
                      nullable: true,
                      description:
                        "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                      example: "carlee.cert1c9f9b6fd@mailinator.com",
                    },
                    children: {
                      type: "array",
                      items: {
                        type: "object",
                        description:
                          "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                        properties: {
                          operation: {
                            type: "string",
                            enum: [
                              "EQUALS",
                              "NOT_EQUALS",
                              "CONTAINS",
                              "HAS",
                              "AND",
                              "OR",
                            ],
                            description:
                              "Supported operations on ProvisioningCriteria",
                            example: "EQUALS",
                          },
                          attribute: {
                            type: "string",
                            description:
                              "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                            example: "email",
                            nullable: true,
                          },
                          value: {
                            type: "string",
                            nullable: true,
                            description:
                              "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                              example: "carlee.cert1c9f9b6fd@mailinator.com",
                          },
                          children: {
                            type: "array",
                            items: {
                              type: "object",
                              description:
                                "Defines matching criteria for an Account to be provisioned with a specific Access Profile",
                              properties: {
                                operation: {
                                  type: "string",
                                  enum: [
                                    "EQUALS",
                                    "NOT_EQUALS",
                                    "CONTAINS",
                                    "HAS",
                                    "AND",
                                    "OR",
                                  ],
                                  description:
                                    "Supported operations on ProvisioningCriteria",
                                  example: "EQUALS",
                                },
                                attribute: {
                                  type: "string",
                                  description:
                                    "Name of the Account attribute to be tested. If **operation** is one of EQUALS, NOT_EQUALS, CONTAINS, or HAS, this field is required. Otherwise, specifying it is an error.",
                                  example: "email",
                                  nullable: true,
                                },
                                value: {
                                  type: "string",
                                  description:
                                    "String value to test the Account attribute w/r/t the specified operation. If the operation is one of EQUALS, NOT_EQUALS, or CONTAINS, this field is required. Otherwise, specifying it is an error. If the Attribute is not String-typed, it will be converted to the appropriate type.",
                                  example:
                                    "carlee.cert1c9f9b6fd@mailinator.com",
                                },
                              },
                            },
                            nullable: true,
                            description:
                              "Array of child criteria. Required if the operation is AND or OR, otherwise it must be left null. A maximum of three levels of criteria are supported, including leaf nodes.",
                            example: null,
                          },
                        },
                      },
                      nullable: true,
                      description:
                        "Array of child criteria. Required if the operation is AND or OR, otherwise it must be left null. A maximum of three levels of criteria are supported, including leaf nodes.",
                        example: null,
                    },
                  },
                },
              },
              required: ["owner", "name", "source"],
            },
          },
        },
      },
      400: {
        description: "Client Error - Returned if the request body is invalid.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                detailCode: {
                  type: "string",
                  description:
                    "Fine-grained error code providing more detail of the error.",
                  example: "400.1 Bad Request Content",
                },
                trackingId: {
                  type: "string",
                  description: "Unique tracking id for the error.",
                  example: "e7eab60924f64aa284175b9fa3309599",
                },
                messages: {
                  type: "array",
                  description: "Generic localized reason for error",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
                causes: {
                  type: "array",
                  description:
                    "Plain-text descriptive reasons to provide additional detail to the text provided in the messages field",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description:
          "Unauthorized - Returned if there is no authorization header, or if the JWT token is expired.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: {
                  description: "A message describing the error",
                  example: "JWT validation failed: JWT is expired",
                },
              },
            },
          },
        },
      },
      403: {
        description:
          "Forbidden - Returned if the user you are running as, doesn't have access to this end-point.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                detailCode: {
                  type: "string",
                  description:
                    "Fine-grained error code providing more detail of the error.",
                  example: "400.1 Bad Request Content",
                },
                trackingId: {
                  type: "string",
                  description: "Unique tracking id for the error.",
                  example: "e7eab60924f64aa284175b9fa3309599",
                },
                messages: {
                  type: "array",
                  description: "Generic localized reason for error",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
                causes: {
                  type: "array",
                  description:
                    "Plain-text descriptive reasons to provide additional detail to the text provided in the messages field",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
              },
            },
            examples: {
              403: {
                summary: "An example of a 403 response object",
                value: {
                  detailCode: "403 Forbidden",
                  trackingId: "b21b1f7ce4da4d639f2c62a57171b427",
                  messages: [
                    {
                      locale: "en-US",
                      localeOrigin: "DEFAULT",
                      text: "The server understood the request but refuses to authorize it.",
                    },
                  ],
                },
              },
            },
          },
        },
      },
      429: {
        description:
          "Too Many Requests - Returned in response to too many requests in a given period of time - rate limited. The Retry-After header in the response includes how long to wait before trying again.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  description: "A message describing the error",
                  example: " Rate Limit Exceeded ",
                },
              },
            },
          },
        },
      },
      500: {
        description:
          "Internal Server Error - Returned if there is an unexpected error.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                detailCode: {
                  type: "string",
                  description:
                    "Fine-grained error code providing more detail of the error.",
                  example: "400.1 Bad Request Content",
                },
                trackingId: {
                  type: "string",
                  description: "Unique tracking id for the error.",
                  example: "e7eab60924f64aa284175b9fa3309599",
                },
                messages: {
                  type: "array",
                  description: "Generic localized reason for error",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
                causes: {
                  type: "array",
                  description:
                    "Plain-text descriptive reasons to provide additional detail to the text provided in the messages field",
                  items: {
                    type: "object",
                    properties: {
                      locale: {
                        type: "string",
                        description:
                          "The locale for the message text, a BCP 47 language tag.",
                        example: "en-US",
                      },
                      localeOrigin: {
                        type: "string",
                        enum: ["DEFAULT", "REQUEST"],
                        description:
                          "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                        example: "DEFAULT",
                      },
                      text: {
                        type: "string",
                        description:
                          "Actual text of the error message in the indicated locale.",
                        example:
                          "The request was syntactically correct but its content is semantically invalid.",
                      },
                    },
                  },
                },
              },
            },
            examples: {
              500: {
                summary: "An example of a 500 response object",
                value: {
                  detailCode: "500.0 Internal Fault",
                  trackingId: "b21b1f7ce4da4d639f2c62a57171b427",
                  messages: [
                    {
                      locale: "en-US",
                      localeOrigin: "DEFAULT",
                      text: "An internal fault occurred.",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    security: [{ oauth2: ["idn:access-profile:manage"] }],
  },
  put: {
    operationId: "putAccessProfile",
  },
  patch: {
    operationId: "patchAccessProfile",
  },
  delete: {
    operationId: "deleteAccessProfile",
  },
};

let invalidAccessProfileOperationId = {
  get: {
    tags: ["Access Profiles"],
    summary: "List Access Profiles",
    operationId: "pathAccessProfiles",
    description:
      "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
    responses: {
      200: {
        description: "List of Access Profiles",
        content: {
          "application/json": {
            schema: {
              type: "array",
            },
          },
        },
      },
    },
    security: [{ oauth2: ["idn:access-profile:read"] }],
  },
  post: {
    tags: ["Access Profiles"],
    summary: "Create an Access Profile",
    operationId: "createAccessProfile",
    description:
      "This API creates an Access Profile.\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API. In addition, a token with only ROLE_SUBADMIN or SOURCE_SUBADMIN authority must be associated with the Access Profile's Source.\nThe maximum supported length for the description field is 2000 characters. Longer descriptions will be preserved for existing access profiles, however, any new access profiles as well as any updates to existing descriptions will be limited to 2000 characters.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["owner", "name", "source"],
          },
        },
      },
    },
    responses: {},
    security: [{ oauth2: ["idn:access-profile:manage"] }],
  },
};

let invalidDeleteAndPatchAccessProfileOperationIds = {
  get: {
    tags: ["Access Profiles"],
    summary: "List Access Profiles",
    operationId: "listAccessProfiles",
    description:
      "This API returns a list of Access Profiles.\n\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API.",
    responses: {
      200: {
        description: "List of Access Profiles",
        content: {
          "application/json": {
            schema: {
              type: "array",
            },
          },
        },
      },
    },
    security: [{ oauth2: ["idn:access-profile:read"] }],
  },
  post: {
    tags: ["Access Profiles"],
    summary: "Create an Access Profile",
    operationId: "createAccessProfile",
    description:
      "This API creates an Access Profile.\nA token with API, ORG_ADMIN, ROLE_ADMIN, ROLE_SUBADMIN, SOURCE_ADMIN, or SOURCE_SUBADMIN authority is required to call this API. In addition, a token with only ROLE_SUBADMIN or SOURCE_SUBADMIN authority must be associated with the Access Profile's Source.\nThe maximum supported length for the description field is 2000 characters. Longer descriptions will be preserved for existing access profiles, however, any new access profiles as well as any updates to existing descriptions will be limited to 2000 characters.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["owner", "name", "source"],
          },
        },
      },
    },
    responses: {},
    security: [{ oauth2: ["idn:access-profile:manage"] }],
  },
  delete: {
    operationId: "ridAccessProfile",
  },
  patch: {
    operationId: "checkAccessProfile",
  },
};

describe("Path Operation Check Function", () => {
  test("Should not return any errors for valid operationIds", () => {
    const result = operationCheck(jsonPaths, { rule: ruleNumber });
    expect(result).toEqual([]);
  });

  test("Should return errors for invalid operationId", () => {
    const result = operationCheck(invalidAccessProfileOperationId, { rule: ruleNumber });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: path is invalid, the operationId must start with one of the allowed values [compare,export,get,list,search] for get endpoints that return an array of results`,
        path: ["get", "operationId"],
      },
    ]);
  });

  test("Should return errors for invalid operationIds for delete and patch endpoints", () => {
    const result = operationCheck(invalidDeleteAndPatchAccessProfileOperationIds, { rule: ruleNumber });
    expect(result).toEqual([
      {
        message: `Rule ${ruleNumber}: rid is invalid, the operationId must start with one of the allowed values [delete,remove] for delete endpoints`,
        path: ["delete", "operationId"],
      },
      {
        message: `Rule ${ruleNumber}: check is invalid, the operationId must start with one of the allowed values [patch,update] for patch endpoints`,
        path: ["patch", "operationId"],
      },
    ]);
  });
});