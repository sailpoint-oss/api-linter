import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";
import {Route, Subroute} from "./types.js";

const validMethods = ["GET", "POST", "PUT", "PATCH"]
const legacyVersions = ["beta", "v3"]
const versionPattern = /v20\d{2}/

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },(routes: Route[], options: {}) => {
        let results: {message: string}[] = [];
        if (!Array.isArray(routes)) {
            results.push({
                message: `Expected routes to be an array`
            });

            return results
        }

        for (const route of routes) {
            if (route.subroutes === undefined || route.subroutes.size == 0) {
                continue
            }

            // static casting because pnpm converts the subroutes map into a javascript object
            const subrouteMap = new Map<string, Subroute>(Object.entries(route.subroutes));
            subrouteMap.forEach((subroute, name) => {

                subroute.methods?.forEach(method => {
                    if (!validMethods.includes(method)) {
                        results.push({
                            message: `subroute ${name} has an invalid method: ${method}`
                        });
                    }
                })

                const versionStart: number = route.versionStart ?? 0
                const versionEnd: number = route.versionEnd ?? 0
                subroute.versions?.forEach(version => {
                    if (legacyVersions.includes(version)) {
                        if (!route.additionalVersions?.includes(version)) {
                            results.push({
                                message: `subroute ${name} has a version that is not included in the route's additionalVersions array: ${version}`
                            });
                        }
                    } else if (versionPattern.test(version) && versionStart > 0) { // check versions that start with v (eg. v2025)

                        const versionNum = version.substring(version.indexOf("v") + 1)
                        if (Number.parseInt(versionNum) < versionStart) {
                            results.push({
                                message: `subroute ${name} has an invalid version [lower than versionStart]: ${version}`
                            });
                        } else if (versionEnd > 0 && Number.parseInt(versionNum) > versionEnd) {
                            results.push({
                                message: `subroute ${name} has an invalid version [greater than versionEnd]: ${version}`
                            });
                        }
                    } else {
                        results.push({
                            message: `subroute ${name} has a version that could not be parsed: ${version}`
                        });
                    }
                })

                if (subroute.rateLimit === undefined && (subroute.rights === undefined || subroute.rights.length == 0)) {
                    results.push({
                        message: `subroute ${name} must have either an array of rights or a defined rate limit`
                    });
                }

                if (subroute.rateLimit === undefined && subroute.rateLimitIntervalSeconds !== undefined) {
                    results.push({
                        message: `subroute ${name} has attribute rateLimitIntervalSeconds but is missing rateLimit`
                    });
                }

                if (subroute.rateLimit !== undefined && subroute.rateLimitIntervalSeconds === undefined) {
                    results.push({
                        message: `subroute ${name} has attribute rateLimit but is missing rateLimitIntervalSeconds`
                    });
                }

                if (subroute.rateLimit !== undefined && subroute.rateLimit <= 0) {
                    results.push({
                        message: `subroute ${name} must have a rateLimit value greater than 0`
                    });
                }

                if (subroute.rateLimitIntervalSeconds !== undefined && subroute.rateLimitIntervalSeconds <= 0) {
                    results.push({
                        message: `subroute ${name} must have a rateLimitIntervalSeconds value greater than 0`
                    });
                }
            })
        }

        return results
    })