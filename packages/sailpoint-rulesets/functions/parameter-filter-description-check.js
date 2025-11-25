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
}, (targetVal, options, context) => {
    const { rule } = options;
    const oneNewLine = new RegExp("([^\n]\n[^\n])+");
    if (oneNewLine.test(targetVal)) {
        return [
            {
                message: `Rule ${rule}: Each line in the description for filters must always be separated by two lines.`,
            },
        ];
    }
    let parts = targetVal.split("\n\n");
    if (parts[0] !==
        "Filter results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#filtering-results)") {
        return [
            {
                message: `Rule ${rule}: The first two lines in the description for filters must follow the example provided in the guide for rule ${rule}.`,
            },
        ];
    }
    if (parts[1] !==
        "Filtering is supported for the following fields and operators:") {
        return [
            {
                message: `Rule ${rule}: The first two lines in the description for filters must follow the example provided in the guide for rule ${rule}.`,
            },
        ];
    }
    let i = 2;
    while (i < parts.length && parts[i].includes(": ")) {
        const filters = parts[i].split(":");
        const property = filters[0];
        const operations = filters[1].trim();
        const prop = property.replaceAll("*", "");
        // Check that the property is bolded
        let regex = new RegExp("^\\*\\*[a-z].*[a-z]\\*\\*$");
        if (!regex.test(property)) {
            return [
                {
                    message: `Rule ${rule}: The property ${prop} must be bolded (ex **${prop}**).`,
                },
            ];
        }
        // Check if there is more than one property on the same line
        regex = new RegExp("[^.a-zA-Z_]");
        if (regex.test(prop)) {
            return [
                {
                    message: `Rule ${rule}: The properties ${prop} must be on separate lines.`,
                },
            ];
        }
        // Check if the operations are wrapped in italics
        regex = new RegExp("^\\*[a-z].*[a-z]\\*$");
        if (!regex.test(operations)) {
            return [
                {
                    message: `Rule ${rule}: The operators for ${prop} must be italicized (ex *eq, co, le*).`,
                },
            ];
        }
        // Check if the operations are comma separated
        regex = new RegExp("^\\*[a-z]+(,\\s[a-z]+)*\\*$");
        if (!regex.test(operations)) {
            return [
                {
                    message: `Rule ${rule}: The operators for ${prop} must be separated with commas and spaces (ex. *eq, co, le*).`,
                },
            ];
        }
        // Check if the an unsupported operator is used
        const supportedOps = [
            "ca",
            "co",
            "eq",
            "ge",
            "gt",
            "in",
            "le",
            "lt",
            "ne",
            "pr",
            "isnull",
            "sw",
        ];
        for (const op of operations.replaceAll("*", "").split(", ")) {
            if (!supportedOps.includes(op)) {
                return [
                    {
                        message: `Rule ${rule}: The property ${prop} contains an unsupported filter operator (${op}).`,
                    },
                ];
            }
        }
        i++;
    }
});
//# sourceMappingURL=parameter-filter-description-check.js.map