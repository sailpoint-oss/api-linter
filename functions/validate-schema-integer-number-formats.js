function parseYamlProperties(targetYaml, pathPrefix, errorResults) {
  if (targetYaml.properties != undefined || targetYaml.properties != null) {
    for (const [key, value] of Object.entries(targetYaml.properties)) {
      //console.dir(`The property ${key} value: ${typeof(value.properties)}`)
      if (
        value.properties != undefined &&
        typeof value.properties == "object"
      ) {
        //console.log(`${key} has type object to parse further`)
        if (pathPrefix == null) {
          parseYamlProperties(value, field, key, errorResults);
        } else if (pathPrefix == "properties") {
          parseYamlProperties(
            value,
            pathPrefix + "." + key,
            errorResults
          );
        } else {
          parseYamlProperties(
            value,
            pathPrefix + ".properties." + key,
            errorResults
          );
        }
      } else {
        // console.log(
        //   `${key} is low level, ready to check for example. ${
        //     pathPrefix + "." + key
        //   }`
        // );
        // console.dir(value);
        if (value.hasOwnProperty("type") && value["type"] == "number") {
          if (!value.hasOwnProperty("format")) {
            results.push({
              message: `The property ${key} must have a format defined with type:number [float, double, decimal]`,
              path: [...pathPrefix.split("."), "properties", key, "format"],
            });
          } else if (
            value.hasOwnProperty("format") &&
            !["float", "double", "decimal"].includes(value["format"])
          ) {
            results.push({
              message: `The property ${key} must have a format defined with type:number [float, double, decimal]`,
              path: [...pathPrefix.split("."), "properties", key, "format"],
            });
          }
        } else if (value.hasOwnProperty("type") && value["type"] == "integer") {
          if (!value.hasOwnProperty("format")) {
            results.push({
              message: `The property ${key} must have a format defined with type:integer [int32, int64, bigint]`,
              path: [...pathPrefix.split("."), "properties", key, "format"],
            });
          } else if (
            value.hasOwnProperty("format") &&
            !["int32", "int64", "bigint"].includes(value["format"])
          ) {
            results.push({
              message: `The property ${key} must have a format defined with type:integer [int32, int64, bigint]`,
              path: [...pathPrefix.split("."), "properties", key, "format"],
            });
          }
        }
      }
    }
  }
}

module.exports = (targetYaml, _opts, context, paths) => {
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
          parseYamlProperties(element, "properties", results)
      }
    });
  }

  // Type Object - If the root level yaml is of type object
  if (
    Object.keys(targetYaml).includes("type") &&
    targetYaml.type == "object" &&
    targetYaml.properties != undefined
  ) {
    parseYamlProperties(targetYaml, "properties", results);
  }

  // Single varaible files
  if (targetYaml.hasOwnProperty("type") && targetYaml["type"] == "number") {
    if (!targetYaml.hasOwnProperty("format")) {
      results.push({
        message: `The property must have a format defined with type:number [float, double, decimal]`,
        path: ["format"],
      });
    } else if (
      targetYaml.hasOwnProperty("format") &&
      !["float", "double", "decimal"].includes(targetYaml["format"])
    ) {
      results.push({
        message: `The property must have a format defined with type:number [float, double, decimal]`,
        path: ["format"],
      });
    }
  } else if (targetYaml.hasOwnProperty("type") && targetYaml["type"] == "integer") {
    if (!targetYaml.hasOwnProperty("format")) {
      results.push({
        message: `The property must have a format defined with type:integer [int32, int64, bigint]`,
        path: ["format"],
      });
    } else if (
      targetYaml.hasOwnProperty("format") &&
      !["int32", "int64", "bigint"].includes(targetYaml["format"])
    ) {
      results.push({
        message: `The property must have a format defined with type:integer [int32, int64, bigint]`,
        path: ["format"],
      });
    }
  }


  return results;
};
