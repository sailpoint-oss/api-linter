// schema-properties-must-have-description:
// message: "{{error}}"
// given: $
// severity: error
// then:
//   function: schema-properties-field-check
//   functionOptions:
//     field: "description"
//     rule: 303
const toNumbers = (arr) => arr.map(function (item) {
    if (isNaN(parseInt(item, 10))) {
        return item;
    }
    else {
        return parseInt(item, 10);
    }
});
function parseYamlProperties(targetYaml, field, pathPrefix, errorResults, rule) {
    if ("properties" in targetYaml && targetYaml.properties != undefined) {
        // Loop through each key under properties
        for (const [key, value] of Object.entries(targetYaml.properties)) {
            // If you run into a key that is an object that has more properties call the function again passing in the lower level object to parse
            if ("properties" in value &&
                value.properties != undefined &&
                typeof value.properties == "object") {
                //console.log(`${key} has type object to parse further`)
                if (pathPrefix == null) {
                    parseYamlProperties(value, field, key, errorResults, rule);
                }
                else if (pathPrefix == "properties") {
                    // If the path to the error to check has properties key then add a . and the key name that you are currently iterating on
                    parseYamlProperties(value, field, pathPrefix + "." + key, errorResults, rule);
                }
                else {
                    // if you come into the function again and the pathPrefix is a key name, then you are in a multi-level object add the current pathPrefix + .properties. + the current key name
                    parseYamlProperties(value, field, pathPrefix + ".properties." + key, errorResults, rule);
                }
            }
            else if (
            // If the code is an array type and it has items and its items are of an object type, handle adding "items" to the pathPrefix appropriately
            /* Example Structure
            {
              "type": "object",
              "properties": {
                "messages": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
      
                    }
                  }
                }
              }
            }
            */
            "type" in value &&
                value.type == "array" &&
                "items" in value &&
                "type" in value.items &&
                value.items.type == "object") {
                if (pathPrefix == null) {
                    parseYamlProperties(value.items, field, key, errorResults, rule);
                }
                else if (pathPrefix == "properties") {
                    parseYamlProperties(value.items, field, pathPrefix + "." + key + ".items", errorResults, rule);
                }
                else {
                    parseYamlProperties(value.items, field, pathPrefix + ".properties." + key + ".items", errorResults, rule);
                }
            }
            else if (
            // If the code is an array type and it has items and those items are of type array and its items are of an object type, handle adding "items.items" to the pathPrefix appropriately
            /* Example Structure
            {
              "type": "object",
              "properties": {
                "messages": {
                  "type": "array",
                  "items": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "propertyToCheck": {
      
                        }
                      }
                    }
                  }
                }
              }
            }
            */
            "type" in value &&
                value.type == "array" &&
                "items" in value &&
                "type" in value.items &&
                value.items.type == "array") {
                if (pathPrefix == null) {
                    parseYamlProperties(value.items.items, field, key, errorResults, rule);
                }
                else if (pathPrefix == "properties") {
                    parseYamlProperties(value.items.items, field, pathPrefix + "." + key + ".items.items", errorResults, rule);
                }
                else {
                    parseYamlProperties(value.items.items, field, pathPrefix + ".properties." + key + ".items.items", errorResults, rule);
                }
            }
            else if ("anyOf" in value || "oneOf" in value || "allOf" in value) {
                // If the property you are checking for a description or example has oneOf as its key,
                // go into the oneOf array and check its properties
                if ("oneOf" in value && value.oneOf != undefined) {
                    value.oneOf.forEach((element, index) => {
                        if (pathPrefix == null && "items" in value) {
                            parseYamlProperties(value.items, field, key, errorResults, rule);
                        }
                        else if (pathPrefix == "properties") {
                            parseYamlProperties(element, field, pathPrefix + "." + key + ".oneOf." + index, errorResults, rule);
                        }
                        else {
                            parseYamlProperties(element, field, pathPrefix + ".properties." + key + ".oneOf." + index, errorResults, rule);
                        }
                    });
                }
                else if ("anyOf" in value && value.anyOf != undefined) {
                    // If the property you are checking for a description or example has anyOf as its key,
                    // go into the anyOf array and check its properties
                    value.anyOf.forEach((element, index) => {
                        if (pathPrefix == null && "items" in value) {
                            parseYamlProperties(value.items, field, key, errorResults, rule);
                        }
                        else if (pathPrefix == "properties") {
                            parseYamlProperties(element, field, pathPrefix + "." + key + ".anyOf." + index, errorResults, rule);
                        }
                        else {
                            parseYamlProperties(element, field, pathPrefix + ".properties." + key + ".anyOf." + index, errorResults, rule);
                        }
                    });
                }
                else if ("allOf" in value && value.allOf != undefined) {
                    // If the property you are checking for a description or example has allOf as its key,
                    // go into the allOf array and check its properties
                    value.allOf.forEach((element, index) => {
                        if (pathPrefix == null && "items" in value) {
                            parseYamlProperties(value.items, field, key, errorResults, rule);
                        }
                        else if (pathPrefix == "properties") {
                            parseYamlProperties(element, field, pathPrefix + "." + key + ".allOf." + index, errorResults, rule);
                        }
                        else {
                            parseYamlProperties(element, field, pathPrefix + ".properties." + key + ".allOf." + index, errorResults, rule);
                        }
                    });
                }
            }
            else {
                const reservedKeywords = [
                    "type",
                    "format",
                    "description",
                    "items",
                    "properties",
                    "additionalProperties",
                    "default",
                    "allOf",
                    "oneOf",
                    "anyOf",
                    "not",
                ];
                if (reservedKeywords.includes(key)) {
                    console.log(`${key} is low level, ready to check for ${field}. ${pathPrefix + ".properties." + key}`);
                    console.log("Reserved Keyword Used");
                    console.log(pathPrefix.split(".")[pathPrefix.split(".").length - 1]);
                    if (pathPrefix.split(".")[pathPrefix.split(".").length - 1] ==
                        "properties") {
                        // @ts-ignore
                        errorResults.push({
                            message: `Rule ${rule}: The property ${key} is a reserved keyword of OpenAPI Specifications. Please use a different name`,
                            path: [...toNumbers(pathPrefix.split(".")), key],
                        });
                    }
                    else {
                        // @ts-ignore
                        errorResults.push({
                            message: `Rule ${rule}: The property ${key} is a reserved keyword of OpenAPI Specifications. Please use a different name`,
                            path: [...toNumbers(pathPrefix.split(".")), "properties", key],
                        });
                    }
                }
            }
        }
    }
}
export default (targetYaml, options) => {
    const { field, rule } = options;
    //console.log(JSON.stringify(targetYaml));
    let results = [];
    // All Of - If the root level yaml contains the key allOf
    if ("allOf" in targetYaml && targetYaml.allOf != undefined) {
        targetYaml.allOf.forEach((element, index) => {
            if ("type" in element &&
                element.type == "object" &&
                "properties" in element &&
                element.properties != undefined) {
                parseYamlProperties(element, field, `allOf.${index}`, results, rule);
            }
        });
    }
    // Type Object - If the root level yaml is of type object
    if ("type" in targetYaml &&
        targetYaml.type == "object" &&
        "properties" in targetYaml &&
        targetYaml.properties != undefined) {
        parseYamlProperties(targetYaml, field, "properties", results, rule);
    }
    // Type String
    if ("type" in targetYaml &&
        targetYaml.type != "object" &&
        field in targetYaml &&
        targetYaml[field] != null) {
        // @ts-ignore
        results.push({
            message: `Rule ${rule}: This field must have a ${field}`,
            path: [field],
        });
    }
    console.log(results);
    return results;
};
//# sourceMappingURL=schema-reserved-keywords-check.js.map