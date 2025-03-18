import { IRuleResult } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";

function parseYamlProperties(
  targetYaml: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  pathPrefix: string,
  errorResults: IRuleResult[]
) {
  if (!("properties" in targetYaml) || targetYaml.properties == undefined) return;
  if ("$ref" in targetYaml) return;

  for (const [field, value] of Object.entries(targetYaml.properties)) {
    //console.dir(`The property ${field} value: ${typeof(value.properties)}`)
    if ("properties" in value && value.properties != undefined && typeof value.properties == "object") {
      //console.log(`${field} has type object to parse further`)
      if (pathPrefix == null) {
        parseYamlProperties(value, field, errorResults);
      } else if (pathPrefix == "properties") {
        parseYamlProperties(value, pathPrefix + "." + field, errorResults);
      } else {
        parseYamlProperties(
          value,
          pathPrefix + ".properties." + field,
          errorResults
        );
      }
    } else {
      // console.log(
      //   `${field} is low level, ready to check for example. ${
      //     pathPrefix + "." + field
      //   }`
      // );
      // console.dir(value);
      if ("type" in value && value["type"] == "number") {
        if (
          pathPrefix.split(".")[pathPrefix.split(".").length - 1] ==
          "properties"
        ) {
          if (!("format" in value) || value.format == undefined) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:number [float, double, decimal]`,
              path: [...pathPrefix.split("."), field, "format"],
            });
          } else if (
            "format" in value &&
            value.format != undefined &&
            !["float", "double", "decimal"].includes(value["format"])
          ) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:number [float, double, decimal]`,
              path: [...pathPrefix.split("."), field, "format"],
            });
          }
        } else {
          if (!("format" in value) || value.format == undefined) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:number [float, double, decimal]`,
              path: [...pathPrefix.split("."), "properties", field, "format"],
            });
          } else if (
            "format" in value &&
            value.format != undefined &&
            !["float", "double", "decimal"].includes(value["format"])
          ) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:number [float, double, decimal]`,
              path: [...pathPrefix.split("."), "properties", field, "format"],
            });
          }
        }
      } else if (
        "type" in value &&
        value["type"] == "integer"
      ) {
        if (
          pathPrefix.split(".")[pathPrefix.split(".").length - 1] ==
          "properties"
        ) {
          if (!("format" in value) || value.format == undefined) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:integer [int32, int64, bigint]`,
              path: [...pathPrefix.split("."), field, "format"],
            });
          } else if (
            "format" in value &&
            value.format != undefined &&
            !["int32", "int64", "bigint"].includes(value["format"])
          ) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:integer [int32, int64, bigint]`,
              path: [...pathPrefix.split("."), field, "format"],
            });
          }
        } else {
          if (!("format" in value) || value.format == undefined) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:integer [int32, int64, bigint]`,
              path: [...pathPrefix.split("."), "properties", field, "format"],
            });
          } else if (
            "format" in value &&
            value.format != undefined &&
            !["int32", "int64", "bigint"].includes(value["format"])
          ) {
            // @ts-ignore
            errorResults.push({
              message: `The property ${field} must have a format defined with type:integer [int32, int64, bigint]`,
              path: [...pathPrefix.split("."), "properties", field, "format"],
            });
          }
        }
      }
    }
  }
}

export default (targetYaml: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, options: { rule: string }, context: any) => {
  //console.log(JSON.stringify(targetYaml));
  const { rule } = options;

  let results: IRuleResult[] = [];

  // All Of - If the root level yaml contains the field allOf
  if ("allOf" in targetYaml && targetYaml.allOf != undefined) {
    targetYaml.allOf.forEach((element: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, index: number) => {
      if (
        "type" in element &&
        element.type != undefined &&
        element.type == "object" &&
        "properties" in element &&
        element.properties != undefined
      ) {
        parseYamlProperties(element, "properties", results);
      }
    });
  }

  // Type Object - If the root level yaml is of type object
  if (
    "type" in targetYaml &&
    targetYaml.type == "object" &&
    "properties" in targetYaml &&
    targetYaml.properties != undefined
  ) {
    parseYamlProperties(targetYaml, "properties", results);
  }

  // Single varaible files
  if (
    "type" in targetYaml &&
    targetYaml.type == "number"
  ) {
    if (!("format" in targetYaml) || targetYaml.format == undefined) {
      // @ts-ignore
      results.push({
        message: `The property must have a format defined with type:number [float, double, decimal]`,
        path: ["format"],
      });
    } else if (
      "format" in targetYaml &&
      targetYaml.format != undefined &&
      !["float", "double", "decimal"].includes(targetYaml["format"])
    ) {
      // @ts-ignore
      results.push({
        message: `The property must have a format defined with type:number [float, double, decimal]`,
        path: ["format"],
      });
    }
  } else if (
    "type" in targetYaml &&
    targetYaml.type == "integer"
  ) { 
    if (!("format" in targetYaml) || targetYaml.format == undefined) {
      // @ts-ignore
      results.push({
        message: `The property must have a format defined with type:integer [int32, int64, bigint]`,
        path: ["format"],
      });
    } else if (
      "format" in targetYaml &&
      targetYaml.format != undefined &&
      !["int32", "int64", "bigint"].includes(targetYaml["format"])
    ) {
      // @ts-ignore
      results.push({
        message: `The property must have a format defined with type:integer [int32, int64, bigint]`,
        path: ["format"],
      });
    }
  }

  // Add the rule number to each result message
  results.forEach((result) => {
    result.message = `Rule ${rule}: ${result.message}`;
  });

  return results;
};
