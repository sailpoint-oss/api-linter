// path-summary-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#305"
// given: $[*]
// severity: warn
// then:
//   function: summary-check
//   functionOptions:
//     rule: 305



import pkg from '@stoplight/spectral-core';
const { createRulesetFunction } = pkg;

export default createRulesetFunction(
  {
    input: true,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
      },
      required: ["rule"],
    },
  },
  (targetVal, options) => {
    const { rule } = options;

    let results = [];

    for (const [key, value] of Object.entries(targetVal)) {
        if (value.summary === undefined || value.summary == null) {
            results.push({
                message: `Rule ${rule}: a brief summary must be provided and be no longer than 5 words`,
                path: [key, 'summary'],
              });
        }
    }

    return results;
  });