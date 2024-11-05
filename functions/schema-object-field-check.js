// Example Rule for function
// Checks that a given field exists for root level schema objects, in the case of below we are checking that a required field is defined for
// schema-objects-must-have-required-parameters:
// message: "${{error}}"
// given: $
// severity: error
// then:
//   function: schema-object-field-check
//   functionOptions:
//     field: required

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
        field: true,
      },
      required: ["rule", "field"],
    },
  },
  (targetYaml, options) => {
  const { rule, field } = options;

  //console.dir(targetYaml);
  let results = [];

  // All Of - If the root level yaml contains the key allOf
  if (Object.keys(targetYaml)[0] == "allOf") {
    targetYaml.allOf.forEach((element, index) => {
      if (
        (element.type != undefined &&
          element.type == "object" &&
          element.hasOwnProperty(field) &&
          (element[field] == null) ||
    (element[field] != null && element[field].length == 0))
      ) {
        results.push({
          message: `Rule ${rule}: If a ${field} key is defined for a schema object, it must not be null or empty`,
          path: [`allOf`, parseInt(index), field],
        });
      }
    });
  }

  //console.log(targetYaml[field].length == 0)
  //console.log((targetYaml[field] == null || targetYaml[field].length == 0))
  // Type Object - If the root level yaml is of type object
  if (
    (Object.keys(targetYaml).includes("type") &&
      targetYaml.type == "object" &&
      targetYaml.hasOwnProperty(field) &&
      (targetYaml[field] == null) ||
    (targetYaml[field] != null && targetYaml[field].length == 0))
  ) {
    results.push({
      message: `Rule ${rule}: If a ${field} key is defined for a schema object, it must not be null or empty`,
      path: [field],
    });
  }

  return results;
});
