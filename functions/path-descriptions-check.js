// path-description-html-chars:
// message: "{{error}}"
// given: $[*].description
// severity: error
// then:
//   function: path-descriptions-check
//   functionOptions:
//     rule: 405

import pkg from '@stoplight/spectral-core';
const { createRulesetFunction } = pkg;

export default createRulesetFunction(
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
  (targetVal, options) => {
    const { rule } = options;

    let regex = new RegExp("<.*?>");
    if (regex.test(targetVal)) {
      // Contains HTML Tags
    return [
        {
            message: `Rule ${rule}: Descriptions should not contain HTML, please use markdown instead.`
        }
    ]
    }
  });