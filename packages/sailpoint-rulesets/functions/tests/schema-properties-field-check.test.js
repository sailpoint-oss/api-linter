import { describe, test, expect } from "vitest";
import schemaPropertiesFieldCheck from "../schema-properties-field-check.js";
const ruleNumber = "304";
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
            description: "Display name of approver to whom the approval was forwarded.",
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
let singleParameterWithMissingExample = {
    type: "string",
    enum: ["GRANT_ACCESS", "REVOKE_ACCESS"],
    description: "Access request type. Defaults to GRANT_ACCESS. REVOKE_ACCESS type can only have a single Identity ID in the requestedFor field. Currently REVOKE_ACCESS is not supported for entitlements.",
};
let singleParameterWithValidExample = {
    type: "string",
    enum: ["GRANT_ACCESS", "REVOKE_ACCESS"],
    description: "Access request type. Defaults to GRANT_ACCESS. REVOKE_ACCESS type can only have a single Identity ID in the requestedFor field. Currently REVOKE_ACCESS is not supported for entitlements.",
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
                    description: "Indicates if all access items for this summary have been decided on",
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
                    description: "Indicates if all access items for this summary have been decided on",
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
                                description: "Human-readable display name of the identity making the comment",
                                example: "Adam Kennedy",
                            },
                            body: {
                                type: "string",
                                description: "Content of the comment",
                                example: "Et quam massa maximus vivamus nisi ut urna tincidunt metus elementum erat.",
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
                                description: "Indicates if all access items for this summary have been decided on",
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
                                description: "Human-readable display name of the identity making the comment",
                                example: "Adam Kennedy",
                            },
                            body: {
                                type: "string",
                                description: "Content of the comment",
                                example: "Et quam massa maximus vivamus nisi ut urna tincidunt metus elementum erat.",
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
                        description: "Native identity in the target system to which the account activity applies",
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
                                description: "Enum represented the currently supported requestable object types. Additional values may be added in the future without notice.",
                                example: "ACCESS_PROFILE",
                            },
                        },
                        description: "If an account activity item is associated with an access request, captures details of that request.",
                    },
                    clientMetadata: {
                        nullable: true,
                        type: "object",
                        additionalProperties: {
                            type: "string",
                        },
                        description: "Arbitrary key-value pairs, if any were included in the corresponding access request item",
                    },
                    removeDate: {
                        nullable: true,
                        type: "string",
                        description: "The date the role or access profile is no longer assigned to the specified identity.",
                        format: "date-time",
                        example: "2020-07-11T00:00:00Z",
                    },
                },
                required: ["id", "type"],
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
            description: "Arbitrary key-value pairs, if any were included in the corresponding access request",
        },
        cancelable: {
            type: "boolean",
            description: "Whether the account activity can be canceled before completion",
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
                    description: "Human-readable display name of the identity making the comment",
                    example: "Adam Kennedy",
                },
                body: {
                    type: "string",
                    description: "Content of the comment",
                    example: "Et quam massa maximus vivamus nisi ut urna tincidunt metus elementum erat.",
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
            description: "A list of Identity IDs for whom the Access is requested. If it's a Revoke request, there can only be one Identity ID.",
            type: "array",
            items: {
                type: "string",
                example: "2c918084660f45d6016617daa9210584",
            },
        },
        requestType: {
            type: "string",
            enum: ["GRANT_ACCESS", "REVOKE_ACCESS"],
            description: "Access request type. Defaults to GRANT_ACCESS. REVOKE_ACCESS type can only have a single Identity ID in the requestedFor field. Currently REVOKE_ACCESS is not supported for entitlements.",
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
                        description: "ID of Role, Access Profile or Entitlement being requested.",
                        example: "2c9180835d2e5168015d32f890ca1581",
                    },
                    comment: {
                        type: "string",
                        description: "Comment provided by requester.\n* Comment is required when the request is of type Revoke Access.\n",
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
                        description: "Arbitrary key-value pairs. They will never be processed by the IdentityNow system but will be returned on associated APIs such as /account-activities.",
                    },
                    removeDate: {
                        type: "string",
                        description: "The date the role or access profile is no longer assigned to the specified identity.\n* Specify a date in the future.\n* The current SLA for the deprovisioning is 24 hours.\n* This date can be modified to either extend or decrease the duration of access item assignments for the specified identity.\n* Currently it is not supported for entitlements.\n",
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
            description: "Arbitrary key-value pairs. They will never be processed by the IdentityNow system but will be returned on associated APIs such as /account-activities.",
        },
    },
    required: ["requestedFor", "requestedItems"],
};
let multiItemArrayUsecase = {
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "Human-readable display name of the item being requested.",
            example: "AccessProfile1",
        },
        type: {
            type: "string",
            enum: ["ACCESS_PROFILE", "ROLE", "ENTITLEMENT"],
            description: "Type of requested object.",
            example: "ACCESS_PROFILE",
        },
        cancelledRequestDetails: {
            type: "object",
            properties: {
                comment: {
                    type: "string",
                    description: "Comment made by the owner when cancelling the associated request.",
                    example: "Nisl quis ipsum quam quisque condimentum nunc ut dolor nunc.",
                },
                owner: {
                    type: "object",
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
                            description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                            example: "IDENTITY",
                        },
                        id: {
                            type: "string",
                            description: "ID of the object to which this reference applies",
                            example: "2c91808568c529c60168cca6f90c1313",
                        },
                        name: {
                            type: "string",
                            description: "Human-readable display name of the object to which this reference applies",
                            example: "William Wilson",
                        },
                    },
                },
                modified: {
                    type: "string",
                    format: "date-time",
                    description: "Date comment was added by the owner when cancelling the associated request",
                    example: "2019-12-20T09:17:12.192Z",
                },
            },
            description: "Provides additional details for a request that has been cancelled.",
        },
        errorMessages: {
            type: "array",
            items: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        locale: {
                            type: "string",
                            description: "The locale for the message text, a BCP 47 language tag.",
                            example: "en-US",
                        },
                        localeOrigin: {
                            type: "string",
                            enum: ["DEFAULT", "REQUEST"],
                            description: "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                            example: "DEFAULT",
                        },
                        text: {
                            type: "string",
                            description: "Actual text of the error message in the indicated locale.",
                            example: "The request was syntactically correct but its content is semantically invalid.",
                        },
                    },
                },
            },
            description: "List of list of localized error messages, if any, encountered during the approval/provisioning process.",
        },
        state: {
            type: "string",
            enum: [
                "EXECUTING",
                "REQUEST_COMPLETED",
                "CANCELLED",
                "TERMINATED",
                "PROVISIONING_VERIFICATION_PENDING",
                "REJECTED",
                "PROVISIONING_FAILED",
                "NOT_ALL_ITEMS_PROVISIONED",
                "ERROR",
            ],
            description: "Indicates the state of an access request:\n* EXECUTING: The request is executing, which indicates the system is doing some processing.\n* REQUEST_COMPLETED: Indicates the request  has been completed.\n* CANCELLED: The request was cancelled with no user input.\n* TERMINATED: The request has been terminated before it was able to complete.\n* PROVISIONING_VERIFICATION_PENDING: The request has finished any approval steps and provisioning is waiting to be verified.\n* REJECTED: The request was rejected.\n* PROVISIONING_FAILED: The request has failed to complete.\n* NOT_ALL_ITEMS_PROVISIONED: One or more of the requested items failed to complete, but there were one or more  successes.\n* ERROR: An error occurred during request processing.",
            example: "EXECUTING",
        },
        approvalDetails: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    forwarded: {
                        type: "boolean",
                        description: "True if the request for this item was forwarded from one owner to another.",
                    },
                    originalOwner: {
                        type: "object",
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
                                description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                example: "IDENTITY",
                            },
                            id: {
                                type: "string",
                                description: "ID of the object to which this reference applies",
                                example: "2c91808568c529c60168cca6f90c1313",
                            },
                            name: {
                                type: "string",
                                description: "Human-readable display name of the object to which this reference applies",
                                example: "William Wilson",
                            },
                        },
                    },
                    currentOwner: {
                        type: "object",
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
                                description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                example: "IDENTITY",
                            },
                            id: {
                                type: "string",
                                description: "ID of the object to which this reference applies",
                                example: "2c91808568c529c60168cca6f90c1313",
                            },
                            name: {
                                type: "string",
                                description: "Human-readable display name of the object to which this reference applies",
                                example: "William Wilson",
                            },
                        },
                    },
                    reviewedBy: {
                        type: "object",
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
                                description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                example: "IDENTITY",
                            },
                            id: {
                                type: "string",
                                description: "ID of the object to which this reference applies",
                                example: "2c91808568c529c60168cca6f90c1313",
                            },
                            name: {
                                type: "string",
                                description: "Human-readable display name of the object to which this reference applies",
                                example: "William Wilson",
                            },
                        },
                    },
                    modified: {
                        type: "string",
                        format: "date-time",
                        description: "Time at which item was modified.",
                        example: "2019-08-23T18:52:57.398Z",
                    },
                    status: {
                        type: "string",
                        enum: [
                            "PENDING",
                            "APPROVED",
                            "REJECTED",
                            "EXPIRED",
                            "CANCELLED",
                            "ARCHIVED",
                        ],
                        description: "Indicates the state of the request processing for this item:\n* PENDING: The request for this item is awaiting processing.\n* APPROVED: The request for this item has been approved.\n* REJECTED: The request for this item was rejected.\n* EXPIRED: The request for this item expired with no action taken.\n* CANCELLED: The request for this item was cancelled with no user action.\n* ARCHIVED: The request for this item has been archived after completion.",
                        example: "PENDING",
                    },
                    scheme: {
                        type: "string",
                        enum: [
                            "APP_OWNER",
                            "SOURCE_OWNER",
                            "MANAGER",
                            "ROLE_OWNER",
                            "ACCESS_PROFILE_OWNER",
                            "GOVERNANCE_GROUP",
                        ],
                        description: "Describes the individual or group that is responsible for an approval step.",
                    },
                    errorMessages: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                locale: {
                                    type: "string",
                                    description: "The locale for the message text, a BCP 47 language tag.",
                                    example: "en-US",
                                },
                                localeOrigin: {
                                    type: "string",
                                    enum: ["DEFAULT", "REQUEST"],
                                    description: "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                                    example: "DEFAULT",
                                },
                                text: {
                                    type: "string",
                                    description: "Actual text of the error message in the indicated locale.",
                                    example: "The request was syntactically correct but its content is semantically invalid.",
                                },
                            },
                        },
                        description: "If the request failed, includes any error messages that were generated.",
                    },
                    comment: {
                        type: "string",
                        description: "Comment, if any, provided by the approver.",
                    },
                    removeDate: {
                        type: "string",
                        description: "The date the role or access profile is no longer assigned to the specified identity.",
                        format: "date-time",
                        example: "2020-07-11T00:00:00Z",
                    },
                },
            },
            description: "Approval details for each item.",
        },
        manualWorkItemDetails: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    forwarded: {
                        type: "boolean",
                        description: "True if the request for this item was forwarded from one owner to another.",
                        example: true,
                    },
                    originalOwner: {
                        type: "object",
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
                                description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                example: "IDENTITY",
                            },
                            id: {
                                type: "string",
                                description: "ID of the object to which this reference applies",
                                example: "2c91808568c529c60168cca6f90c1313",
                            },
                            name: {
                                type: "string",
                                description: "Human-readable display name of the object to which this reference applies",
                                example: "William Wilson",
                            },
                        },
                    },
                    currentOwner: {
                        type: "object",
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
                                description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                example: "IDENTITY",
                            },
                            id: {
                                type: "string",
                                description: "ID of the object to which this reference applies",
                                example: "2c91808568c529c60168cca6f90c1313",
                            },
                            name: {
                                type: "string",
                                description: "Human-readable display name of the object to which this reference applies",
                                example: "William Wilson",
                            },
                        },
                    },
                    modified: {
                        type: "string",
                        format: "date-time",
                        description: "Time at which item was modified.",
                        example: "2019-08-23T18:52:57.398Z",
                    },
                    status: {
                        type: "string",
                        enum: [
                            "PENDING",
                            "APPROVED",
                            "REJECTED",
                            "EXPIRED",
                            "CANCELLED",
                            "ARCHIVED",
                        ],
                        description: "Indicates the state of the request processing for this item:\n* PENDING: The request for this item is awaiting processing.\n* APPROVED: The request for this item has been approved.\n* REJECTED: The request for this item was rejected.\n* EXPIRED: The request for this item expired with no action taken.\n* CANCELLED: The request for this item was cancelled with no user action.\n* ARCHIVED: The request for this item has been archived after completion.",
                        example: "PENDING",
                    },
                },
            },
            description: "Manual work items created for provisioning the item.",
        },
        accountActivityItemId: {
            type: "string",
            description: "Id of associated account activity item.",
            example: "2c9180926cbfbddd016cbfc7c3b10010",
        },
        requestType: {
            type: "string",
            enum: ["GRANT_ACCESS", "REVOKE_ACCESS"],
            description: "Access request type. Defaults to GRANT_ACCESS. REVOKE_ACCESS type can only have a single Identity ID in the requestedFor field. Currently REVOKE_ACCESS is not supported for entitlements.",
            example: "GRANT_ACCESS",
        },
        modified: {
            type: "string",
            format: "date-time",
            description: "When the request was last modified.",
            example: "2019-08-23T18:52:59.162Z",
        },
        created: {
            type: "string",
            format: "date-time",
            description: "When the request was created.",
            example: "2019-08-23T18:40:35.772Z",
        },
        requester: {
            type: "object",
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
                    description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                    example: "IDENTITY",
                },
                id: {
                    type: "string",
                    description: "ID of the object to which this reference applies",
                    example: "2c91808568c529c60168cca6f90c1313",
                },
                name: {
                    type: "string",
                    description: "Human-readable display name of the object to which this reference applies",
                    example: "William Wilson",
                },
            },
        },
        requestedFor: {
            type: "object",
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
                    description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                    example: "IDENTITY",
                },
                id: {
                    type: "string",
                    description: "ID of the object to which this reference applies",
                    example: "2c91808568c529c60168cca6f90c1313",
                },
                name: {
                    type: "string",
                    description: "Human-readable display name of the object to which this reference applies",
                    example: "William Wilson",
                },
            },
        },
        requesterComment: {
            type: "object",
            properties: {
                comment: {
                    type: "string",
                    description: "Content of the comment",
                    example: "Et quam massa maximus vivamus nisi ut urna tincidunt metus elementum erat",
                },
                author: {
                    type: "object",
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
                            description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                            example: "IDENTITY",
                        },
                        id: {
                            type: "string",
                            description: "ID of the author",
                            example: "2c91808568c529c60168cca6f90c1313",
                        },
                        name: {
                            type: "string",
                            description: "Human-readable display name of the identity making the comment",
                            example: "Adam Kennedy",
                        },
                    },
                },
                created: {
                    type: "string",
                    format: "date-time",
                    description: "Date and time comment was created",
                    example: "2017-07-11T18:45:37.098Z",
                },
            },
        },
        sodViolationContext: {
            description: "An object referencing a completed SOD violation check",
            type: "object",
            properties: {
                state: {
                    type: "string",
                    enum: ["SUCCESS", "ERROR"],
                    description: "The status of SOD violation check",
                    example: "SUCCESS",
                },
                uuid: {
                    description: "The id of the Violation check event",
                    type: "string",
                    example: "f73d16e9-a038-46c5-b217-1246e15fdbdd",
                },
                violationCheckResult: {
                    description: "The inner object representing the completed SOD Violation check",
                    type: "object",
                    properties: {
                        message: {
                            type: "object",
                            properties: {
                                locale: {
                                    type: "string",
                                    description: "The locale for the message text, a BCP 47 language tag.",
                                    example: "en-US",
                                },
                                localeOrigin: {
                                    type: "string",
                                    enum: ["DEFAULT", "REQUEST"],
                                    description: "An indicator of how the locale was selected. *DEFAULT* means the locale is the system default. *REQUEST* means the locale was selected from the request context (i.e., best match based on the *Accept-Language* header). Additional values may be added in the future without notice.",
                                    example: "DEFAULT",
                                },
                                text: {
                                    type: "string",
                                    description: "Actual text of the error message in the indicated locale.",
                                    example: "The request was syntactically correct but its content is semantically invalid.",
                                },
                            },
                        },
                        clientMetadata: {
                            type: "object",
                            additionalProperties: { type: "string" },
                            description: "Arbitrary key-value pairs. They will never be processed by the IdentityNow system but will be returned on completion of the violation check.",
                            example: {
                                requestedAppName: "test-app",
                                requestedAppId: "2c91808f7892918f0178b78da4a305a1",
                            },
                        },
                        violationContexts: {
                            type: "array",
                            items: {
                                description: "The contextual information of the violated criteria",
                                type: "object",
                                properties: {
                                    policy: {
                                        type: "object",
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
                                                description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                                example: "IDENTITY",
                                            },
                                            id: {
                                                type: "string",
                                                description: "ID of the object to which this reference applies",
                                                example: "2c91808568c529c60168cca6f90c1313",
                                            },
                                            name: {
                                                type: "string",
                                                description: "Human-readable display name of the object to which this reference applies",
                                                example: "William Wilson",
                                            },
                                        },
                                    },
                                    conflictingAccessCriteria: {
                                        type: "object",
                                        description: "The object which contains the left and right hand side of the entitlements that got violated according to the policy.",
                                        properties: {
                                            leftCriteria: {
                                                type: "object",
                                                properties: {
                                                    criteriaList: {
                                                        type: "array",
                                                        items: {
                                                            description: "Details of the Entitlement criteria",
                                                            type: "object",
                                                            properties: {
                                                                existing: {
                                                                    type: "boolean",
                                                                    example: true,
                                                                    description: "If the entitlement already belonged to the user or not.",
                                                                },
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
                                                                    description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                                                    example: "IDENTITY",
                                                                },
                                                                id: {
                                                                    type: "string",
                                                                    description: "Entitlement ID",
                                                                    example: "2c918085771e9d3301773b3cb66f6398",
                                                                },
                                                                name: {
                                                                    type: "string",
                                                                    description: "Entitlement name",
                                                                    example: "My HR Entitlement",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                            rightCriteria: {
                                                type: "object",
                                                properties: {
                                                    criteriaList: {
                                                        type: "array",
                                                        items: {
                                                            description: "Details of the Entitlement criteria",
                                                            type: "object",
                                                            properties: {
                                                                existing: {
                                                                    type: "boolean",
                                                                    example: true,
                                                                    description: "If the entitlement already belonged to the user or not.",
                                                                },
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
                                                                    description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                                                    example: "IDENTITY",
                                                                },
                                                                id: {
                                                                    type: "string",
                                                                    description: "Entitlement ID",
                                                                    example: "2c918085771e9d3301773b3cb66f6398",
                                                                },
                                                                name: {
                                                                    type: "string",
                                                                    description: "Entitlement name",
                                                                    example: "My HR Entitlement",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        violatedPolicies: {
                            type: "array",
                            description: "A list of the Policies that were violated",
                            items: {
                                type: "object",
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
                                        description: "An enumeration of the types of DTOs supported within the IdentityNow infrastructure.",
                                        example: "IDENTITY",
                                    },
                                    id: {
                                        type: "string",
                                        description: "ID of the object to which this reference applies",
                                        example: "2c91808568c529c60168cca6f90c1313",
                                    },
                                    name: {
                                        type: "string",
                                        description: "Human-readable display name of the object to which this reference applies",
                                        example: "William Wilson",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        provisioningDetails: {
            type: "object",
            properties: {
                orderedSubPhaseReferences: {
                    type: "string",
                    description: 'Ordered CSV of sub phase references to objects that contain more information about provisioning. For example, this can contain "manualWorkItemDetails" which indicate that there is further information in that object for this phase.',
                    example: "manualWorkItemDetails",
                },
            },
            description: "Provides additional details about provisioning for this request.",
        },
        preApprovalTriggerDetails: {
            type: "object",
            properties: {
                comment: {
                    type: "string",
                    description: "Comment left for the pre-approval decision",
                    example: "Access is Approved",
                },
                reviewer: {
                    type: "string",
                    description: "The reviewer of the pre-approval decision",
                    example: "John Doe",
                },
                decision: {
                    type: "string",
                    enum: ["APPROVED", "REJECTED"],
                    description: "The decision of the pre-approval trigger",
                    example: "APPROVED",
                },
            },
            description: "Provides additional details about the pre-approval trigger for this request.",
        },
        accessRequestPhases: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    started: {
                        type: "string",
                        description: "The time that this phase started.",
                        format: "date-time",
                        example: "2020-07-11T00:00:00Z",
                    },
                    finished: {
                        type: "string",
                        description: "The time that this phase finished.",
                        format: "date-time",
                        example: "2020-07-12T00:00:00Z",
                    },
                    name: {
                        type: "string",
                        description: "The name of this phase.",
                        example: "APPROVAL_PHASE",
                    },
                    state: {
                        type: "string",
                        enum: ["PENDING", "EXECUTING", "COMPLETED", "CANCELLED"],
                        description: "The state of this phase.",
                        example: "COMPLETED",
                    },
                    result: {
                        type: "string",
                        enum: ["SUCCESSFUL", "FAILED"],
                        description: "The state of this phase.",
                        example: "SUCCESSFUL",
                    },
                    phaseReference: {
                        type: "string",
                        description: "A reference to another object on the RequestedItemStatus that contains more details about the phase. Note that for the Provisioning phase, this will be empty if there are no manual work items.",
                        example: "approvalDetails",
                    },
                },
                description: "Provides additional details about this access request phase.",
            },
            description: "A list of Phases that the Access Request has gone through in order, to help determine the status of the request.",
        },
        description: {
            type: "string",
            description: "Description associated to the requested object.",
            example: "This is the Engineering role that engineers are granted.",
        },
        removeDate: {
            type: "string",
            format: "date-time",
            description: "When the role access is scheduled for removal.",
            example: "2019-10-23T00:00:00.000Z",
        },
        cancelable: {
            type: "boolean",
            description: "True if the request can be canceled.",
            example: true,
        },
        accessRequestId: {
            type: "string",
            format: "uuid",
            description: "This is the account activity id.",
            example: "ef38f94347e94562b5bb8424a56397d8",
        },
    },
};
let nullableExampleUsecase = {
    type: "object",
    properties: {
        oldApproverName: {
            type: "string",
            nullable: true,
        },
        newApproverName: {
            type: "string",
            description: "Display name of approver to whom the approval was forwarded.",
            nullable: true,
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
describe("Schema Properties Field Check", () => {
    test("Should not return any error messages when all parameters have an example", () => {
        expect(schemaPropertiesFieldCheck(allOfParametersCheck, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([]);
    });
    test("Should return all properties that do not have an example", () => {
        expect(schemaPropertiesFieldCheck(allOfParametersCheckWithMissingExamples, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([
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
        ]);
    });
    test("Should return all properties that do not have an example for a single object", () => {
        expect(schemaPropertiesFieldCheck(singleObjectParameterCheckWithMissingExamples, { rule: ruleNumber, field: "example" })).toEqual([
            {
                message: `Rule ${ruleNumber}: The property oldApproverName must have a example`,
                path: ["properties", "oldApproverName", "example"],
            },
            {
                message: `Rule ${ruleNumber}: The property newApproverName must have a example`,
                path: ["properties", "newApproverName", "example"],
            },
        ]);
    });
    test("Should not return any error messages for a single object when all parameters have an example", () => {
        expect(schemaPropertiesFieldCheck(singleObjectParameterCheckWithValidExamples, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([]);
    });
    test("Should return error message for a single property without an example", () => {
        expect(schemaPropertiesFieldCheck(singleParameterWithMissingExample, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([
            {
                message: `Rule ${ruleNumber}: This field must have a example`,
                path: ["example"],
            },
        ]);
    });
    test("Should return no errors for a single property with a valid example", () => {
        expect(schemaPropertiesFieldCheck(singleParameterWithValidExample, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([]);
    });
    test("Should return errors for multi-level property objects", () => {
        expect(schemaPropertiesFieldCheck(multilevelSchemaObjectWithMissingExamples, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([
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
        ]);
    });
    test("Should return errors for super multi-level schema object", () => {
        expect(schemaPropertiesFieldCheck(superMultilevelSchemaObject, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([
            {
                message: "Rule 304: The property completed must have a example",
                path: [
                    "properties",
                    "requesterIdentitySummary",
                    "properties",
                    "completed",
                    "example",
                ],
            },
            {
                message: "Rule 304: The property completed must have a example",
                path: [
                    "properties",
                    "targetIdentitySummary",
                    "properties",
                    "completed",
                    "example",
                ],
            },
            {
                message: "Rule 304: The property warnings must have a example that is not null",
                path: ["properties", "warnings", "example"],
            },
            {
                message: "Rule 304: The property name must have a example",
                path: ["properties", "items", "items", "properties", "name", "example"],
            },
            {
                message: "Rule 304: The property approvalStatus must have a example",
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
                message: "Rule 304: The property provisioningStatus must have a example",
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
                message: "Rule 304: The property completed must have a example",
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
                message: "Rule 304: The property operation must have a example",
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
                message: "Rule 304: The property executionStatus must have a example",
                path: ["properties", "executionStatus", "example"],
            },
            {
                message: "Rule 304: The property clientMetadata must have a example",
                path: ["properties", "clientMetadata", "example"],
            },
            {
                message: "Rule 304: The property cancelable must have a example",
                path: ["properties", "cancelable", "example"],
            },
        ]);
    });
    test("Should return no errors with item array example", () => {
        expect(schemaPropertiesFieldCheck(itemArrayExample, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([]);
    });
    test("Should return errors with multi item->array type example", () => {
        expect(schemaPropertiesFieldCheck(multiItemArrayUsecase, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([
            {
                message: `Rule ${ruleNumber}: The property forwarded must have a example`,
                path: [
                    "properties",
                    "approvalDetails",
                    "items",
                    "properties",
                    "forwarded",
                    "example",
                ],
            },
            {
                message: `Rule ${ruleNumber}: The property scheme must have a example`,
                path: [
                    "properties",
                    "approvalDetails",
                    "items",
                    "properties",
                    "scheme",
                    "example",
                ],
            },
            {
                message: `Rule ${ruleNumber}: The property comment must have a example`,
                path: [
                    "properties",
                    "approvalDetails",
                    "items",
                    "properties",
                    "comment",
                    "example",
                ],
            },
        ]);
    });
    test("Should return no errors with nullable true fields missing examples", () => {
        expect(schemaPropertiesFieldCheck(nullableExampleUsecase, {
            rule: ruleNumber,
            field: "example",
        })).toEqual([]);
    });
    test("Should return errors with nullable true fields with missing description", () => {
        expect(schemaPropertiesFieldCheck(nullableExampleUsecase, {
            rule: ruleNumber,
            field: "description",
        })).toEqual([
            {
                message: "Rule 304: The property oldApproverName must have a description",
                path: ["properties", "oldApproverName", "description"],
            },
        ]);
    });
});
//# sourceMappingURL=schema-properties-field-check.test.js.map