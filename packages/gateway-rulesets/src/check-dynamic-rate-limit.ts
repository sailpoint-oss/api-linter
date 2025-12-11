import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { DynamicRateLimitConfig, OrgDynamicRateLimitConfig, RouteDynamicRateLimitConfig, SubrouteDynamicRateLimitConfig } from "./types.js";

const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },
    (config: DynamicRateLimitConfig, options: {}) => {
        const results: { message: string }[] = [];

        if (typeof config !== "object" || config === null) {
            results.push({
                message: `Expected dynamic rate limit config to be an object`
            });
            return results;
        }

        // Iterate through each org
        for (const [orgName, orgConfig] of Object.entries(config)) {
            if (typeof orgConfig !== "object" || orgConfig === null) {
                results.push({
                    message: `Organization "${orgName}" config must be an object`
                });
                continue;
            }

            // Iterate through each route-id within the org
            for (const [routeId, routeConfig] of Object.entries(orgConfig as OrgDynamicRateLimitConfig)) {
                if (typeof routeConfig !== "object" || routeConfig === null) {
                    results.push({
                        message: `Route config for "${orgName}:${routeId}" must be an object`
                    });
                    continue;
                }

                const typedRouteConfig = routeConfig as RouteDynamicRateLimitConfig;

                // Validate rate-limit
                if (typedRouteConfig["rate-limit"] === undefined) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" is missing required field "rate-limit"`
                    });
                } else if (typeof typedRouteConfig["rate-limit"] !== "number" || typedRouteConfig["rate-limit"] <= 0) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" has invalid "rate-limit". Must be a positive number, got: ${typedRouteConfig["rate-limit"]}`
                    });
                }

                // Validate rate-limit-interval
                if (typedRouteConfig["rate-limit-interval"] === undefined) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" is missing required field "rate-limit-interval"`
                    });
                } else if (typeof typedRouteConfig["rate-limit-interval"] !== "number" || typedRouteConfig["rate-limit-interval"] <= 0) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" has invalid "rate-limit-interval". Must be a positive number, got: ${typedRouteConfig["rate-limit-interval"]}`
                    });
                }

                // Validate methods
                if (typedRouteConfig.methods !== undefined) {
                    if (!Array.isArray(typedRouteConfig.methods)) {
                        results.push({
                            message: `Route "${orgName}:${routeId}" has invalid "methods". Must be an array, got: ${typeof typedRouteConfig.methods}`
                        });
                    } else {
                        for (const method of typedRouteConfig.methods) {
                            if (typeof method !== "string") {
                                results.push({
                                    message: `Route "${orgName}:${routeId}" has invalid method type. Must be a string, got: ${typeof method}`
                                });
                            } else if (!validMethods.includes(method)) {
                                results.push({
                                    message: `Route "${orgName}:${routeId}" has invalid method: "${method}". Valid methods are: ${validMethods.join(", ")}`
                                });
                            }
                        }
                    }
                }

                // Validate subroutes
                if (typedRouteConfig.subroutes !== undefined) {
                    if (!Array.isArray(typedRouteConfig.subroutes)) {
                        results.push({
                            message: `Route "${orgName}:${routeId}" has invalid "subroutes". Must be an array, got: ${typeof typedRouteConfig.subroutes}`
                        });
                    } else {
                        for (let i = 0; i < typedRouteConfig.subroutes.length; i++) {
                            const subrouteEntry = typedRouteConfig.subroutes[i];

                            if (typeof subrouteEntry !== "object" || subrouteEntry === null) {
                                results.push({
                                    message: `Route "${orgName}:${routeId}" subroute at index ${i} must be an object`
                                });
                                continue;
                            }

                            const subrouteEntries = Object.entries(subrouteEntry as SubrouteDynamicRateLimitConfig);

                            if (subrouteEntries.length === 0) {
                                results.push({
                                    message: `Route "${orgName}:${routeId}" subroute at index ${i} is empty`
                                });
                                continue;
                            }

                            if (subrouteEntries.length > 1) {
                                results.push({
                                    message: `Route "${orgName}:${routeId}" subroute at index ${i} should have exactly one path key, got ${subrouteEntries.length} keys`
                                });
                            }

                            for (const [path, subrouteConfig] of subrouteEntries) {
                                if (typeof subrouteConfig !== "object" || subrouteConfig === null) {
                                    results.push({
                                        message: `Route "${orgName}:${routeId}" subroute "${path}" config must be an object`
                                    });
                                    continue;
                                }

                                // Validate subroute rate-limit
                                if (subrouteConfig["rate-limit"] === undefined) {
                                    results.push({
                                        message: `Route "${orgName}:${routeId}" subroute "${path}" is missing required field "rate-limit"`
                                    });
                                } else if (typeof subrouteConfig["rate-limit"] !== "number" || subrouteConfig["rate-limit"] <= 0) {
                                    results.push({
                                        message: `Route "${orgName}:${routeId}" subroute "${path}" has invalid "rate-limit". Must be a positive number, got: ${subrouteConfig["rate-limit"]}`
                                    });
                                }

                                // Validate subroute rate-limit-interval
                                if (subrouteConfig["rate-limit-interval"] === undefined) {
                                    results.push({
                                        message: `Route "${orgName}:${routeId}" subroute "${path}" is missing required field "rate-limit-interval"`
                                    });
                                } else if (typeof subrouteConfig["rate-limit-interval"] !== "number" || subrouteConfig["rate-limit-interval"] <= 0) {
                                    results.push({
                                        message: `Route "${orgName}:${routeId}" subroute "${path}" has invalid "rate-limit-interval". Must be a positive number, got: ${subrouteConfig["rate-limit-interval"]}`
                                    });
                                }

                                // Validate subroute methods
                                if (subrouteConfig.methods !== undefined) {
                                    if (!Array.isArray(subrouteConfig.methods)) {
                                        results.push({
                                            message: `Route "${orgName}:${routeId}" subroute "${path}" has invalid "methods". Must be an array, got: ${typeof subrouteConfig.methods}`
                                        });
                                    } else {
                                        for (const method of subrouteConfig.methods) {
                                            if (typeof method !== "string") {
                                                results.push({
                                                    message: `Route "${orgName}:${routeId}" subroute "${path}" has invalid method type. Must be a string, got: ${typeof method}`
                                                });
                                            } else if (!validMethods.includes(method)) {
                                                results.push({
                                                    message: `Route "${orgName}:${routeId}" subroute "${path}" has invalid method: "${method}". Valid methods are: ${validMethods.join(", ")}`
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // If there are errors, combine them into a single message
        if (results.length > 0) {
            const errorMessages = results.map((r, index) => `${index + 1}. ${r.message}`).join('\n');
            return [{
                message: `Found ${results.length} validation error(s):\n${errorMessages}`
            }];
        }

        return [];
    }
);
