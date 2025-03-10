// Example Rule Usage
// path-summary-length:
//  given: $[*].summary
//  severity: error
//  then:
//    function: word-length
//    functionOptions:
//      maxWordCount: 5

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
        maxWordCount: true,
      },
      required: ["rule", "maxWordCount"],
    },
  },
  (targetVal: string, options: { rule: string; maxWordCount: number }) => {
    const { rule, maxWordCount } = options;
    if (targetVal.split(" ").length > maxWordCount) {
      return [
        {
          message: `Rule ${rule}: The summary value for a path should not exceed ${maxWordCount} words`,
        },
      ];
    }
  },
);
