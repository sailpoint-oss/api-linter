import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
const validMethods = ["GET", "POST", "PUT", "PATCH"];
const legacyVersions = ["alpha", "beta", "v3"];
const versionPattern = /v20\d{2}/;
export default createOptionalContextRulesetFunction({
    input: null,
    options: {},
}, (routes, options) => {
    const results = [];
    if (!Array.isArray(routes)) {
        results.push({
            message: `Expected routes to be an array`
        });
    }
    for (const route of routes) {
        if (route.subroutes === null || route.subroutes?.size == 0) {
            continue;
        }
        route.subroutes?.forEach((subroute, name) => {
            subroute.methods?.forEach(method => {
                if (!validMethods.includes(method)) {
                    results.push({
                        message: `subroute ${name} has an invalid method: ${method}`
                    });
                }
            });
            const versionStart = route.versionStart ?? 0;
            const versionEnd = route.versionEnd ?? 0;
            subroute.versions?.forEach(version => {
                if (legacyVersions.includes(version) && !route.additionalVersions?.includes(version)) {
                    results.push({
                        message: `subroute ${name} has a version that is not included in the route's additionalVersions array: ${version}`
                    });
                }
                else if (versionPattern.test(version) && versionStart > 0) {
                    const versionNum = version.substring(version.indexOf("v") + 1);
                    if (Number.isNaN(versionNum)) {
                        results.push({
                            message: `subroute ${name} has an invalid version (Not A Number): ${version}`
                        });
                    }
                    else if (Number.parseInt(versionNum) < versionStart) {
                    }
                }
            });
        });
    }
});
//# sourceMappingURL=check-subroutes.js.map