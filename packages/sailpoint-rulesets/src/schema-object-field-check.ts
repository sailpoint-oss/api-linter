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

import { IRuleResult } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";

export default (
  targetYaml: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  options: { field: string; rule: string },
) => {
  const { field, rule } = options;

  if ("$ref" in targetYaml) return;

  //console.dir(targetYaml);
  let results: IRuleResult[] = [];

  // All Of - If the root level yaml contains the key allOf
  if ("allOf" in targetYaml && targetYaml.allOf != undefined) {
    targetYaml.allOf.forEach(
      (
        element: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
        index: number,
      ) => {
        if (
          ("type" in element &&
            element.type != undefined &&
            element.type == "object" &&
            field in element &&
            // @ts-ignore
            element[field] == null) ||
          // @ts-ignore
          (element[field] != null && element[field].length == 0)
        ) {
          // @ts-ignore
          results.push({
            message: `Rule ${rule}: If a ${field} key is defined for a schema object, it must not be null or empty`,
            path: [`allOf`, index.toString(), field],
          });
        }
      },
    );
  }

  //console.log(targetYaml[field].length == 0)
  //console.log((targetYaml[field] == null || targetYaml[field].length == 0))
  // Type Object - If the root level yaml is of type object
  if (
    (Object.keys(targetYaml).includes("type") &&
      targetYaml.type == "object" &&
      field in targetYaml &&
      // @ts-ignore
      targetYaml[field] == null) ||
    // @ts-ignore
    (targetYaml[field] != null && targetYaml[field].length == 0)
  ) {
    // @ts-ignore
    results.push({
      message: `Rule ${rule}: If a ${field} key is defined for a schema object, it must not be null or empty`,
      path: [field],
    });
  }

  return results;
};
