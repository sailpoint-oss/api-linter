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

  if (targetVal.security != undefined) {
    let hasUserAuth = false;
    for (const [key, value] of Object.entries(targetVal.security)) {
      if (value.userAuth != undefined) {
        hasUserAuth = true;
      }
    }
    if (hasUserAuth) {
      if (targetVal['x-sailpoint-userlevels'] != undefined) {
        return [
          {
            message: `Rule ${rule}: Improper spelling of x-sailpoint-userLevels. Please check your spelling, including capital letters.`,
          },
        ];
      } else if (targetVal['x-sailpoint-userLevels'] === undefined || targetVal['x-sailpoint-userLevels'] === null || targetVal['x-sailpoint-userLevels'].length === 0) {
        return [
          {
            message: `Rule ${rule}: Operations that specify security.userAuth must define the necessary user levels`,
          },
        ];
      }
    } 
  }
});
