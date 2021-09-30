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

module.exports = (targetYaml, _opts) => {
  const { rule, field } = _opts;
  
  results = [];

  // All Of - If the root level yaml contains the key allOf
  if (Object.keys(targetYaml)[0] == "allOf") {
    targetYaml.allOf.forEach((element, index) => {
      if (
        element.type != undefined &&
        element.type == "object" &&
        !element.hasOwnProperty(field)
      ) {
        results.push({
          message: `Rule ${rule}: All schema objects must have a ${field} field defined`,
          path: [`allOf`, parseInt(index), field],
        });
      }
    });
  }

  // Type Object - If the root level yaml is of type object
  if (
    Object.keys(targetYaml).includes("type") &&
    targetYaml.type == "object" &&
    !targetYaml.hasOwnProperty(field)
  ) {
    results.push({
      message: `Rule ${rule}: All schema objects must have a ${field} field defined`,
      path: [field],
    });
  }

  return results;
};
