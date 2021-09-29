function parseYamlProperties(targetYaml, field, pathPrefix, errorResults, rule) {
  if (targetYaml.properties != undefined || targetYaml.properties != null) {
    for (const [key, value] of Object.entries(targetYaml.properties)) {
      //console.dir(`The property ${key} value: ${typeof(value.properties)}`)
      if (
        value.properties != undefined &&
        typeof value.properties == "object"
      ) {
        //console.log(`${key} has type object to parse further`)
        if (pathPrefix == null) {
          parseYamlProperties(value, field, key, errorResults, rule);
        } else if (pathPrefix == "properties") {
          parseYamlProperties(
            value,
            field,
            pathPrefix + "." + key,
            errorResults,
            rule
          );
        } else {
          parseYamlProperties(
            value,
            field,
            pathPrefix + ".properties." + key,
            errorResults,
            rule
          );
        }
      } else {
        //console.log(`${key} is low level, ready to check for example. ${pathPrefix + "." + key}`)
        if (!value.hasOwnProperty(field) && value[field] == null) {
          //console.log(`Example is defined for ${key}:  ${value.example}`)
          errorResults.push({
            message: `Rule ${rule}: The property ${key} must have a ${field}`,
            path: [...pathPrefix.split("."), "properties", key, field],
          });
        }
      }
    }
  }
}

module.exports = (targetYaml, _opts, context, paths) => {
  const { field, rule } = _opts;
  //console.log(JSON.stringify(targetYaml));

  results = [];

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

  return results;
};
