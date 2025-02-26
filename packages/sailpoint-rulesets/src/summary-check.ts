// path-summary-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#305"
// given: $[*]
// severity: warn
// then:
//   function: summary-check
//   functionOptions:
//     rule: 305

import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
      },
      required: ["rule"],
    },
  },
  (targetVal: OpenAPIV3.PathItemObject, options: { rule: string }) => {
    const { rule } = options;

    let results = [];

    for (const [key, value] of Object.entries(targetVal)) {
      if (
        typeof value === "object" &&
        "summary" in value &&
        (value.summary === undefined || value.summary == null)
      ) {
        results.push({
          message: `Rule ${rule}: a brief summary must be provided and be no longer than 5 words`,
          path: [key, "summary"],
        });
      }
    }

    return results;
  },
);
