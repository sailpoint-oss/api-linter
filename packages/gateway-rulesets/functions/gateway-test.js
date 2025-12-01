import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction({
    input: null,
    options: {
        type: "object",
        additionalProperties: false,
        properties: {
            rule: true,
        },
        required: ["rule"],
    },
}, (targetVal, options) => {
    const { rule } = options;
    console.log(targetVal);
    return [];
});
//# sourceMappingURL=gateway-test.js.map