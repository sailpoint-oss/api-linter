// path-list-endpoints-must-support-pagination:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#159"
// given: $.get
// severity: error
// then:
//   function: path-query-parameter-pagination-check
//   functionOptions:
//     rule: 159
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
    let results = [];
    if ("200" in targetVal.responses &&
        "content" in targetVal.responses["200"] &&
        targetVal.responses["200"]?.content?.["application/json"]?.schema &&
        "type" in
            targetVal.responses["200"]?.content?.["application/json"]?.schema &&
        targetVal.responses["200"]?.content?.["application/json"]?.schema?.type ==
            "array") {
        let offsetFound = false;
        let limitFound = false;
        if (targetVal.parameters != undefined) {
            for (const [key, value] of Object.entries(targetVal.parameters)) {
                if ("in" in value &&
                    value.in === "query" &&
                    "name" in value &&
                    value.name === "limit") {
                    limitFound = true;
                    if ("schema" in value &&
                        value.schema &&
                        // @ts-expect-error OpenAPI Extenstions are valid
                        (value.schema.minimum == null || value.schema.maximum == null)) {
                        // @ts-expect-error OpenAPI Extenstions are valid
                        if (value.schema.minimum == null) {
                            results.push({
                                message: `Rule ${rule}: All GET list operations must have a minimum defined for the 'limit' query parameter`,
                            });
                        }
                        // @ts-expect-error OpenAPI Extenstions are valid
                        if (value.schema.maximum == null) {
                            results.push({
                                message: `Rule ${rule}: All GET list operations must have a maximum defined for the 'limit' query parameter`,
                            });
                        }
                    }
                }
                if ("in" in value &&
                    value.in == "query" &&
                    "name" in value &&
                    value.name == "offset") {
                    offsetFound = true;
                }
            }
        }
        if (!offsetFound) {
            results.push({
                message: `Rule ${rule}: All GET list operations must have offset as a query parameter`,
            });
        }
        if (!limitFound) {
            results.push({
                message: `Rule ${rule}: All GET list operations must have limit as a query parameter`,
            });
        }
    }
    return results;
});
//# sourceMappingURL=path-query-parameter-pagination-check.js.map