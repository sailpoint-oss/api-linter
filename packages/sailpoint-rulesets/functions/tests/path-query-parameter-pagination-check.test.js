import pathQueryParameterPaginationCheck from "../path-query-parameter-pagination-check.js";

const ruleNumber = 159;

const jsonValidPagination =
{
    "parameters": [
        {
            "in": "query",
            "name": "limit",
            "description": "Max number of results to return.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 250,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "maximum": 250,
                "default": 250
            }
        },
        {
            "in": "query",
            "name": "offset",
            "description": "Offset into the full result set. Usually specified with *limit* to paginate through the results.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 0,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "default": 0
            }
        }
    ],
    "responses": {
        "200": {
            "description": "List of identityProfiles.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "../schemas/IdentityProfile.yaml"
                        }
                    }
                }
            }
        }
    }
};

const jsonMissingLimit =
{
    "parameters": [
        {
            "in": "query",
            "name": "offset",
            "description": "Offset into the full result set. Usually specified with *limit* to paginate through the results.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 0,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "default": 0
            }
        }
    ],
    "responses": {
        "200": {
            "description": "List of identityProfiles.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "../schemas/IdentityProfile.yaml"
                        }
                    }
                }
            }
        }
    }
};

const jsonMissingOffset =
{
    "parameters": [
        {
            "in": "query",
            "name": "limit",
            "description": "Max number of results to return.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 250,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "maximum": 250,
                "default": 250
            }
        }
    ],
    "responses": {
        "200": {
            "description": "List of identityProfiles.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "../schemas/IdentityProfile.yaml"
                        }
                    }
                }
            }
        }
    }
};

const jsonMissingLimitAndOffset =
{
    "parameters": [
        {
            "in": "query",
            "name": "count",
            "description": "If *true* it will populate the *X-Total-Count* response header with the number of results that would be returned if *limit* and *offset* were ignored.\n\nSince requesting a total count can have a performance impact, it is recommended not to send **count=true** if that value will not be used.\n\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": true,
            "schema": {
                "type": "boolean",
                "default": false
            }
        }
    ],
    "responses": {
        "200": {
            "description": "List of identityProfiles.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "../schemas/IdentityProfile.yaml"
                        }
                    }
                }
            }
        }
    }
};

const jsonLimitMissingMinimum =
{
    "parameters": [
        {
            "in": "query",
            "name": "limit",
            "description": "Max number of results to return.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 250,
            "schema": {
                "type": "integer",
                "format": "int32",
                "maximum": 250,
                "default": 250
            }
        },
        {
            "in": "query",
            "name": "offset",
            "description": "Offset into the full result set. Usually specified with *limit* to paginate through the results.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 0,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "default": 0
            }
        }
    ],
    "responses": {
        "200": {
            "description": "List of identityProfiles.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "../schemas/IdentityProfile.yaml"
                        }
                    }
                }
            }
        }
    }
};

const jsonLimitMissingMaximum =
{
    "parameters": [
        {
            "in": "query",
            "name": "limit",
            "description": "Max number of results to return.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 250,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "default": 250
            }
        },
        {
            "in": "query",
            "name": "offset",
            "description": "Offset into the full result set. Usually specified with *limit* to paginate through the results.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 0,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "default": 0
            }
        }
    ],
    "responses": {
        "200": {
            "description": "List of identityProfiles.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "../schemas/IdentityProfile.yaml"
                        }
                    }
                }
            }
        }
    }
};

const jsonLimitMissingMinimumAndMaximum =
{
    "parameters": [
        {
            "in": "query",
            "name": "limit",
            "description": "Max number of results to return.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 250,
            "schema": {
                "type": "integer",
                "format": "int32",
                "default": 250
            }
        },
        {
            "in": "query",
            "name": "offset",
            "description": "Offset into the full result set. Usually specified with *limit* to paginate through the results.\nSee [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters) for more information.",
            "required": false,
            "example": 0,
            "schema": {
                "type": "integer",
                "format": "int32",
                "minimum": 0,
                "default": 0
            }
        }
    ],
    "responses": {
        "200": {
            "description": "List of identityProfiles.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "array",
                        "items": {
                            "$ref": "../schemas/IdentityProfile.yaml"
                        }
                    }
                }
            }
        }
    }
};

describe("Path pagination offset and limit check", () => {
    test("Should not return an error message if offset and limit exist and limit has minimum and maximum defined", () => {
        const result = pathQueryParameterPaginationCheck(jsonValidPagination, { rule: ruleNumber });
        expect(result).toEqual([]);
    });

    test("Should return an error message if limit is missing from query parameters", () => {
        const result = pathQueryParameterPaginationCheck(jsonMissingLimit, { rule: ruleNumber });
        expect(result).toEqual([
            {
                message: `Rule ${ruleNumber}: All GET list operations must have limit as a query parameter`,
            },
        ]);
    });

    test("Should return an error message if offset is missing from query parameters", () => {
        const result = pathQueryParameterPaginationCheck(jsonMissingOffset, { rule: ruleNumber });
        expect(result).toEqual([
            {
                message: `Rule ${ruleNumber}: All GET list operations must have offset as a query parameter`,
            },
        ]);
    });

    test("Should return an error message if limit and offset are missing from query parameters", () => {
        const result = pathQueryParameterPaginationCheck(jsonMissingLimitAndOffset, { rule: ruleNumber });
        expect(result).toEqual([
            {
                message: `Rule ${ruleNumber}: All GET list operations must have offset as a query parameter`,
            },
            {
                message: `Rule ${ruleNumber}: All GET list operations must have limit as a query parameter`,
            },
        ]);
    });

    test("Should return an error message if maximum is not defined for the limit query parameter", () => {
        const result = pathQueryParameterPaginationCheck(jsonLimitMissingMaximum, { rule: ruleNumber });
        expect(result).toEqual([
            {
                message: `Rule ${ruleNumber}: All GET list operations must have maximum defined for limit query parameter`,
            },
        ]);
    });

    test("Should return an error message if minimum is not defined for the limit query parameter", () => {
        const result = pathQueryParameterPaginationCheck(jsonLimitMissingMinimum, { rule: ruleNumber });
        expect(result).toEqual([
            {
                message: `Rule ${ruleNumber}: All GET list operations must have minimum defined for limit query parameter`,
            },
        ]);
    });

    test("Should return an error message if maximum and minimum are not defined for the limit query parameter", () => {
        const result = pathQueryParameterPaginationCheck(jsonLimitMissingMinimumAndMaximum, { rule: ruleNumber });
        expect(result).toEqual([
            {
                message: `Rule ${ruleNumber}: All GET list operations must have minimum defined for limit query parameter`,
            },
            {
                message: `Rule ${ruleNumber}: All GET list operations must have maximum defined for limit query parameter`,
            },
        ]);
    });
});