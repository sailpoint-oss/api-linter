// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import {
    DynamicRateLimitCommonConfigKeys,
    Route, RouteDynamicRateLimitConfigKeys, RouteKeys, SubrouteKeys, VersionDetailsKeys
} from "./types.js";
import {CheckInterfaceForField} from "./utils.js";

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
            type: "object",
            additionalProperties: false,
            properties: {
                value: true,
            },
            required: ["value"],
        },
    },
    (objectToValidate: Object, options: {value: string}) => {
        let errors: {message: string}[] = [];

        switch (options.value) {
            case "route":
                const routeName = (objectToValidate as Route).id
                CheckInterfaceForField(routeName, objectToValidate, RouteKeys, errors)
                break
            case "subroute":
                new Map<string, Object>(Object.entries(objectToValidate)).forEach((subroute, id) => {
                    CheckInterfaceForField(id, subroute, SubrouteKeys, errors)
                })
                break
            case "versionDetail":
                new Map<string, Object>(Object.entries(objectToValidate)).forEach((details, id) => {
                    CheckInterfaceForField(id, details, VersionDetailsKeys, errors)
                })
                break
            case "dynamicRateLimit":
                new Map<string, Object>(Object.entries(objectToValidate)).forEach((rateLimitConfig, routeId) => {
                    CheckInterfaceForField(routeId, rateLimitConfig, RouteDynamicRateLimitConfigKeys, errors)

                    if (rateLimitConfig.hasOwnProperty("subroutes")) {
                        const subroutes = Object.getOwnPropertyDescriptor(rateLimitConfig, "subroutes")
                        new Map<string, Object>(Object.entries(subroutes?.value)).forEach((subroute, endpoint) => {
                            CheckInterfaceForField(endpoint, subroute, DynamicRateLimitCommonConfigKeys, errors)
                        })
                    }
                })
                break
            default:
                errors.push({
                    message: `${options} is not valid`
                });
                break
        }

        return errors
    }
);