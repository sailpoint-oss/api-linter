import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
function countDigits(num) {
    return String(num).split('').reduce((count) => count + 1, 0);
}
let isNonVersioned = false;
// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction({
    input: null,
    options: {},
}, (targetVal, options) => {
    let results = [];
    let digitCount = countDigits(targetVal);
    if (isNonVersioned && digitCount >= 4) {
        results.push({
            message: `versioned apis must be specified above non-versioned apis`
        });
    }
    else {
        if (digitCount == 1) {
            isNonVersioned = true;
        }
    }
    return results;
});
//# sourceMappingURL=check-version-start-order.js.map