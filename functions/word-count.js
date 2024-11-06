// Example Rule Usage
// path-summary-length:
//  given: $[*].summary
//  severity: error
//  then:
//    function: word-length
//    functionOptions:
//      maxWordCount: 5

import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
        maxWordCount: true,
      },
      required: ["rule","maxWordCount"],
    },
  },
  (targetVal, options) => {
    const { rule, maxWordCount } = options;
    if (targetVal.split(" ").length > maxWordCount) {
        return [
            {
                message: `Rule ${rule}: The summary value for a path should not exceed ${maxWordCount} words`
            }
        ]
    }
  });