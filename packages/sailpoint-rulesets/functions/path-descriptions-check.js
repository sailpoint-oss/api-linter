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
    let regex = new RegExp("<.*?>");
    if (regex.test(targetVal)) {
        // Contains HTML Tags
        return [
            {
                message: `Rule ${rule}: Descriptions should not contain HTML, please use markdown instead.`,
            },
        ];
    }
});
//# sourceMappingURL=path-descriptions-check.js.map