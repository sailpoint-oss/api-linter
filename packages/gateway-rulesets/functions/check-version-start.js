import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction({
    input: null,
    options: {},
}, (targetVal, options) => {
    let results = [];
    if (!Number.isInteger(targetVal)) {
        results.push({
            message: `versionStart must be a number`
        });
    }
    if (!(targetVal === 0 || 2024 <= targetVal)) {
        results.push({
            message: `versionStart must be 0 or higher than 2024`
        });
    }
    return results;
});
//# sourceMappingURL=check-version-start.js.map