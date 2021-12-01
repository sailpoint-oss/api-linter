// schema-properties-must-have-description:
// message: "{{error}}"
// given: $
// severity: error
// then:
//   function: schema-properties-field-check
//   functionOptions:
//     field: "description"
//     rule: 303

function parseYamlProperties(
  targetYaml,
  field,
  pathPrefix,
  errorResults,
  rule
) {
  if (targetYaml.properties != undefined || targetYaml.properties != null) {
    // Loop through each key under properties
    for (const [key, value] of Object.entries(targetYaml.properties)) {
      // If you run into a key that is an object that has more properties call the function again passing in the lower level object to parse
      if (
        value.properties != undefined &&
        typeof value.properties == "object"
      ) {
        //console.log(`${key} has type object to parse further`)
        if (pathPrefix == null) {
          parseYamlProperties(value, field, key, errorResults, rule);
        } else if (pathPrefix == "properties") { // If the path to the error to check has properties key then add a . and the key name that you are currently iterating on
          parseYamlProperties(
            value,
            field,
            pathPrefix + "." + key,
            errorResults,
            rule
          );
        } else { // if you come into the function again and the pathPrefix is a key name, then you are in a multi-level object add the current pathPrefix + .properties. + the current key name 
          parseYamlProperties(
            value,
            field,
            pathPrefix + ".properties." + key,
            errorResults,
            rule
          );
        }
      } else if ( // If the code is an array type and it has items and its items are of an object type, handle adding "items" to the pathPrefix appropriately
        value.hasOwnProperty("type") &&
        value.type == "array" &&
        value.hasOwnProperty("items") &&
        value.items.type == "object"
      ) {
        if (pathPrefix == null) {
          parseYamlProperties(value.items, field, key, errorResults, rule);
        } else if (pathPrefix == "properties") {
          parseYamlProperties(
            value.items,
            field,
            pathPrefix + ".items." + key,
            errorResults,
            rule
          );
        } else {
          parseYamlProperties(
            value.items,
            field,
            pathPrefix + ".properties." + key + ".items",
            errorResults,
            rule
          );
        }
      } else {
        // console.log(
        //   `${key} is low level, ready to check for ${field}. ${
        //     pathPrefix + ".properties." + key
        //   }`
        // );
        if (value.type == "array" && value.items != undefined && field == "example" && value.items.hasOwnProperty(field)) {
          console.log("Array Type, checking if items exist");
        } else { // If the key does not define the field we are looking for 
          if (!value.hasOwnProperty(field) && value[field] == null) {
            if (
              pathPrefix.split(".")[pathPrefix.split(".").length - 1] ==
              "properties"
            ) {
              errorResults.push({
                message: `Rule ${rule}: The property ${key} must have a ${field}`,
                path: [...pathPrefix.split("."), key, field],
              });
            } else {
              errorResults.push({
                message: `Rule ${rule}: The property ${key} must have a ${field}`,
                path: [...pathPrefix.split("."), "properties", key, field],
              });
            }
          } else if (value.hasOwnProperty(field) && value[field] == null) { // If the key defines the field we are looking for but is null or empty
            // console.log(
            //   `Rule ${rule}: The property ${key} must have a ${field} that is not null: : ${pathPrefix}.properties.${key}.${field}`
            // );

            if (
              pathPrefix.split(".")[pathPrefix.split(".").length - 1] ==
              "properties"
            ) {
              errorResults.push({
                message: `Rule ${rule}: The property ${key} must have a ${field} that is not null`,
                path: [...pathPrefix.split("."), key, field],
              });
            } else {
              errorResults.push({
                message: `Rule ${rule}: The property ${key} must have a ${field} that is not null`,
                path: [...pathPrefix.split("."), "properties", key, field],
              });
            }
          }
        }
      }
    }
  }
}

module.exports = (targetYaml, _opts) => {
  const { field, rule } = _opts;
  //console.log(JSON.stringify(targetYaml));

  let results = [];

  // All Of - If the root level yaml contains the key allOf
  if (Object.keys(targetYaml)[0] == "allOf") {
    targetYaml.allOf.forEach((element, index) => {
      if (
        element.type != undefined &&
        element.type == "object" &&
        element.properties != undefined
      ) {
        for (const [key, value] of Object.entries(element.properties)) {
          if (!value.hasOwnProperty(field) && value[field] == null) {
            //console.log(`The property ${key} must have a ${field}`);
            results.push({
              message: `Rule ${rule}: The property ${key} must have a ${field}`,
              path: [`allOf`, parseInt(index), "properties", key, field],
            });
          }
        }
      }
    });
  }

  // Type Object - If the root level yaml is of type object
  if (
    Object.keys(targetYaml).includes("type") &&
    targetYaml.type == "object" &&
    targetYaml.properties != undefined
  ) {
    parseYamlProperties(targetYaml, field, "properties", results, rule);
  }

  // Type String
  if (Object.keys(targetYaml).includes("type") && targetYaml.type != "object") {
    if (!targetYaml.hasOwnProperty(field) || targetYaml[field] == null) {
      results.push({
        message: `Rule ${rule}: This field must have a ${field}`,
        path: [field],
      });
    }
  }

  //console.log(results)

  return results;
};
