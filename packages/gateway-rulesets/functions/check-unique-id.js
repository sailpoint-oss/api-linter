import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
let idArray = [];
// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction({
    input: null,
    options: {},
}, (targetVal, options) => {
    let results = [];
    if (idArray.includes(targetVal)) {
        results.push({
            message: `id must be unique`
        });
    }
    else {
        idArray.push(targetVal);
    }
    return results;
});
//# sourceMappingURL=check-unique-id.js.map