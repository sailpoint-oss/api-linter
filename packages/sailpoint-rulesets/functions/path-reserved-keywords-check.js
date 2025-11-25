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
    const reservedKeywords = [
        "type",
        "format",
        "description",
        "items",
        "properties",
        "additionalProperties",
        "default",
        "allOf",
        "oneOf",
        "anyOf",
        "not",
    ];
    const { rule } = options;
    if (targetVal.name != undefined &&
        reservedKeywords.includes(targetVal.name)) {
        return [
            {
                message: `Rule ${rule}: The property ${targetVal.name} is a reserved keyword of OpenAPI Specifications. Please use a different name`,
            },
        ];
    }
});
//# sourceMappingURL=path-reserved-keywords-check.js.map