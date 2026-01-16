import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import {
    DynamicRateLimitConfig, OrgDynamicRateLimitConfig, RouteDynamicRateLimitConfig,
    Subroute
} from "./types.js";

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
                if (typedRouteConfig.rateLimit === undefined) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" is missing required field "rateLimit"`
                    });
                } else if (typedRouteConfig.rateLimit <= 0) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" has invalid "rateLimit". Must be a positive number, got: ${typedRouteConfig.rateLimit}`
                    });
                }

                // Validate rate-limit-interval
                if (typedRouteConfig.rateLimitIntervalSeconds === undefined) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" is missing required field "rateLimitIntervalSeconds"`
                    });
                } else if (typedRouteConfig.rateLimitIntervalSeconds <= 0) {
                    results.push({
                        message: `Route "${orgName}:${routeId}" has invalid "rateLimitIntervalSeconds". Must be a positive number, got: ${typedRouteConfig.rateLimitIntervalSeconds}`
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
                            if (!validMethods.includes(method)) {
                                results.push({
                                    message: `Route "${orgName}:${routeId}" has invalid method: "${method}". Valid methods are: ${validMethods.join(", ")}`
                                });
                            }
                        }
                    }
                }

                // Validate subroutes
                if (typedRouteConfig.subroutes !== undefined) {
                    for (const [endpoint, subrouteConfig] of new Map<string, Subroute>(Object.entries(typedRouteConfig.subroutes))) {
                        if (typeof subrouteConfig !== "object" || subrouteConfig === null) {
                            results.push({
                                message: `Route "${orgName}:${routeId}" subroute at "${endpoint}" must be an object`
                            });
                            continue;
                        }

                        // Validate subroute rate-limit
                        if (subrouteConfig.rateLimit === undefined) {
                            results.push({
                                message: `Route "${orgName}:${routeId}" subroute "${endpoint}" is missing required field "rateLimit"`
                            });
                        } else if (subrouteConfig.rateLimit <= 0) {
                            results.push({
                                message: `Route "${orgName}:${routeId}" subroute "${endpoint}" has invalid "rateLimit". Must be a positive number, got: ${subrouteConfig.rateLimit}`
                            });
                        }

                        // Validate subroute rate-limit-interval
                        if (subrouteConfig.rateLimitIntervalSeconds === undefined) {
                            results.push({
                                message: `Route "${orgName}:${routeId}" subroute "${endpoint}" is missing required field "rateLimitIntervalSeconds"`
                            });
                        } else if (subrouteConfig.rateLimitIntervalSeconds <= 0) {
                            results.push({
                                message: `Route "${orgName}:${routeId}" subroute "${endpoint}" has invalid "rateLimitIntervalSeconds". Must be a positive number, got: ${subrouteConfig.rateLimitIntervalSeconds}`
                            });
                        }

                        // Validate subroute methods
                        if (subrouteConfig.methods !== undefined) {
                            if (!Array.isArray(subrouteConfig.methods)) {
                                results.push({
                                    message: `Route "${orgName}:${routeId}" subroute "${endpoint}" has invalid "methods". Must be an array, got: ${typeof subrouteConfig.methods}`
                                });
                            } else {
                                for (const method of subrouteConfig.methods) {
                                    if (!validMethods.includes(method)) {
                                        results.push({
                                            message: `Route "${orgName}:${routeId}" subroute "${endpoint}" has invalid method: "${method}". Valid methods are: ${validMethods.join(", ")}`
                                        });
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
