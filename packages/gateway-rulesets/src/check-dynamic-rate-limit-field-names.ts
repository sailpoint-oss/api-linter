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
        options: {},
    },
    (incomingDynamicRateLimits: Map<string, Object>, options: { }) => {
        let errors: {message: string}[] = [];

        new Map<string, Object>(Object.entries(incomingDynamicRateLimits)).forEach((rateLimitConfig, routeId) => {
            CheckInterfaceForField(routeId, rateLimitConfig, RouteDynamicRateLimitConfigKeys, errors)

            if (rateLimitConfig.hasOwnProperty("subroutes")) {
                const subroutes = Object.getOwnPropertyDescriptor(rateLimitConfig, "subroutes")
                new Map<string, Object>(Object.entries(subroutes?.value)).forEach((subroute, endpoint) => {
                    CheckInterfaceForField(endpoint, subroute, DynamicRateLimitCommonConfigKeys, errors)
                })
            }
        })

        return errors
    }
);