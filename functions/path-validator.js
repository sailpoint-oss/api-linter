// paths-should-not-have-more-than-three-sub-resources:
// description: ${{error}}
// given: $.paths.*~
// severity: warn
// then:
//   function: path-validator

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
  let path = targetVal.substring(1).split("/");

  let count = 0;
  path.forEach((element) => {
    if (element.indexOf("{") == -1) {
      count += 1;
    }
  });

  if (count > 3) {
    return [
      {
        message: `Rule ${rule}: The path must not exceed 3 sub-resources`,
      },
    ];
  }
});
