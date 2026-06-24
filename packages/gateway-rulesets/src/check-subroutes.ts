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