// schema-optional-boolean-properties-must-have-default:
// message: "{{error}}"
// given: $
// severity: error
// then:
//   function: schema-boolean-field-check
//   functionOptions:
//     rule: 310

import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { IRuleResult } from "@stoplight/spectral-core";

const toNumbers = (arr: string[]) =>
  arr.map(function (item) {
    if (isNaN(parseInt(item, 10))) {
      return item;
    } else {
      return parseInt(item, 10);
    }
  });

let output = "";

function parseYamlProperties(
  targetYaml: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  field: string,
  pathPrefix: string,
  errorResults: IRuleResult[],
  rule: string,
) {
  if ("$ref" in targetYaml || !targetYaml.properties) return;

  // Loop through each key under properties
  for (const [key, value] of Object.entries(targetYaml.properties)) {
    // If you run into a key that is an object that has more properties call the function again passing in the lower level object to parse
    if (
      "properties" in value &&
      value.properties != undefined &&
      typeof value.properties == "object"
    ) {
      //console.log(`${key} has type object to parse further`)
      if (pathPrefix == null) {
        parseYamlProperties(value, field, key, errorResults, rule);
      } else if (pathPrefix == "properties") {
        // If the path to the error to check has properties key then add a . and the key name that you are currently iterating on
        parseYamlProperties(
          value,
          field,
          pathPrefix + "." + key,
          errorResults,
          rule,
        );
      } else {
        // if you come into the function again and the pathPrefix is a key name, then you are in a multi-level object add the current pathPrefix + .properties. + the current key name
        parseYamlProperties(
          value,
          field,
          pathPrefix + ".properties." + key,
          errorResults,
          rule,
        );
      }
    } else if (
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
      value.items.type == "object"
    ) {
      if (pathPrefix == null) {
        parseYamlProperties(value.items, field, key, errorResults, rule);
      } else if (pathPrefix == "properties") {
        parseYamlProperties(
          value.items,
          field,
          pathPrefix + "." + key + ".items",
          errorResults,
          rule,
        );
      } else {
        parseYamlProperties(
          value.items,
          field,
          pathPrefix + ".properties." + key + ".items",
          errorResults,
          rule,
        );
      }
    } else if (
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
      value.items.type == "array" &&
      !("$ref" in value) &&
      !("$ref" in value.items) &&
      !("$ref" in value.items.items)
    ) {
      if (pathPrefix == null) {
        parseYamlProperties(value.items.items, field, key, errorResults, rule);
      } else if (pathPrefix == "properties") {
        parseYamlProperties(
          value.items.items,
          field,
          pathPrefix + "." + key + ".items.items",
          errorResults,
          rule,
        );
      } else {
        parseYamlProperties(
          value.items.items,
          field,
          pathPrefix + ".properties." + key + ".items.items",
          errorResults,
          rule,
        );
      }
    } else if (
      value.hasOwnProperty("anyOf") ||
      value.hasOwnProperty("oneOf") ||
      value.hasOwnProperty("allOf")
    ) {
      // If the property you are checking for a description or example has oneOf as its key,
      // go into the oneOf array and check its properties
      if ("oneOf" in value && value.oneOf != undefined) {
        value.oneOf.forEach((element, index) => {
          if (pathPrefix == null && "items" in value) {
            parseYamlProperties(value.items, field, key, errorResults, rule);
          } else if (pathPrefix == "properties") {
            parseYamlProperties(
              element,
              field,
              pathPrefix + "." + key + ".oneOf." + index,
              errorResults,
              rule,
            );
          } else {
            parseYamlProperties(
              element,
              field,
              pathPrefix + ".properties." + key + ".oneOf." + index,
              errorResults,
              rule,
            );
          }
        });
      } else if ("anyOf" in value && value.anyOf != undefined) {
        // If the property you are checking for a description or example has anyOf as its key,
        // go into the anyOf array and check its properties
        value.anyOf.forEach((element, index) => {
          if (pathPrefix == null && "items" in value) {
            parseYamlProperties(value.items, field, key, errorResults, rule);
          } else if (pathPrefix == "properties") {
            parseYamlProperties(
              element,
              field,
              pathPrefix + "." + key + ".anyOf." + index,
              errorResults,
              rule,
            );
          } else {
            parseYamlProperties(
              element,
              field,
              pathPrefix + ".properties." + key + ".anyOf." + index,
              errorResults,
              rule,
            );
          }
        });
      } else if ("allOf" in value && value.allOf != undefined) {
        // If the property you are checking for a description or example has allOf as its key,
        // go into the allOf array and check its properties
        value.allOf.forEach((element, index) => {
          if (pathPrefix == null && "items" in value) {
            parseYamlProperties(value.items, field, key, errorResults, rule);
          } else if (pathPrefix == "properties") {
            parseYamlProperties(
              element,
              field,
              pathPrefix + "." + key + ".allOf." + index,
              errorResults,
              rule,
            );
          } else {
            parseYamlProperties(
              element,
              field,
              pathPrefix + ".properties." + key + ".allOf." + index,
              errorResults,
              rule,
            );
          }
        });
      }
    } else {
      // console.log(
      //   `${key} is low level, ready to check for ${field}. ${
      //     pathPrefix + ".properties." + key
      //   }`
      //);
      if ("nullable" in value && value.nullable == true && field == "example") {
        // If the property has a nullable:true flag set, allow the example to be null
        //console.log(`${key}: ${JSON.stringify(value)}`)
      } else if (
        "type" in value &&
        value.type == "array" &&
        "items" in value &&
        value.items != undefined &&
        field == "example" &&
        "items" in value.items &&
        value.items.hasOwnProperty(field)
      ) {
        // console.log("Array Type, checking if items exist");
      } else {
        // If the key does not define the field we are looking for
        //console.log(targetYaml);
        if (
          "type" in value &&
          value.type == "boolean" &&
          "required" in targetYaml &&
          targetYaml.required != undefined
        ) {
          if (!targetYaml.required.includes(key)) {
            if (!value.hasOwnProperty("default")) {
              if (
                pathPrefix.split(".")[pathPrefix.split(".").length - 1] ==
                "properties"
              ) {
                // @ts-ignore
                errorResults.push({
                  message: `Rule ${rule}: The boolean property ${key} must have a default value`,
                  path: [...toNumbers(pathPrefix.split(".")), key, "default"],
                });
              } else {
                // @ts-ignore
                errorResults.push({
                  message: `Rule ${rule}: The boolean property ${key} must have a default value`,
                  path: [
                    ...toNumbers(pathPrefix.split(".")),
                    "properties",
                    key,
                    "default",
                  ],
                });
              }
            }
          }
        } else if ("type" in value && value.type == "boolean") {
          if (!value.hasOwnProperty("default")) {
            if (
              pathPrefix.split(".")[pathPrefix.split(".").length - 1] ==
              "properties"
            ) {
              // @ts-ignore
              errorResults.push({
                message: `Rule ${rule}: The boolean property ${key} must have a default value`,
                path: [...toNumbers(pathPrefix.split(".")), key, "default"],
              });
            } else {
              // @ts-ignore
              errorResults.push({
                message: `Rule ${rule}: The boolean property ${key} must have a default value`,
                path: [
                  ...toNumbers(pathPrefix.split(".")),
                  "properties",
                  key,
                  "default",
                ],
              });
            }
          }
        }
      }
    }
  }
}

// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction(
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
  (
    targetYaml: OpenAPIV3.SchemaObject,
    options: { rule: string; field: string },
  ) => {
    const { rule, field } = options;
    //console.log(JSON.stringify(targetYaml));

    let results: IRuleResult[] = [];

    // All Of - If the root level yaml contains the key allOf
    if ("allOf" in targetYaml && targetYaml.allOf != undefined) {
      targetYaml.allOf.forEach((element, index) => {
        if (
          "type" in element &&
          element.type == "object" &&
          "properties" in element &&
          element.properties != undefined
        ) {
          parseYamlProperties(element, field, `allOf.${index}`, results, rule);
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
    if (
      Object.keys(targetYaml).includes("type") &&
      targetYaml.type != "object"
    ) {
      if (
        targetYaml.type == "boolean" &&
        !targetYaml.hasOwnProperty("default")
      ) {
        // @ts-ignore
        results.push({
          message: `Rule ${rule}: This field must have a default value.`,
          path: [field],
        });
      }
    }

    return results;
  },
);
