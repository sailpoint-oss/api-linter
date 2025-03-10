import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { OpenAPIV3 } from "openapi-types";

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
    targetVal: OpenAPIV3.OperationObject,
    options: { rule: string },
    { path },
  ) => {
    const { rule } = options;
    let results = [];
    let deprecatedKeyFound = false;
    let sunsetKeyFound = false;

    const rootPath = path;

    if (targetVal.deprecated != undefined && targetVal.deprecated == true) {
      if (targetVal.parameters != undefined && targetVal.parameters != null) {
        deprecatedKeyFound = false;
        sunsetKeyFound = false;
        for (const [key, value] of Object.entries(targetVal.parameters)) {
          if (
            JSON.stringify(value).indexOf(
              '"in":"header","name":"deprecation"',
            ) == 1
          ) {
            deprecatedKeyFound = true;
          } else if (
            JSON.stringify(value).indexOf('"in":"header","name":"sunset"') == 1
          ) {
            sunsetKeyFound = true;
          }
        }

        if (!deprecatedKeyFound && !sunsetKeyFound) {
          results.push({
            message: `Rule ${rule}: The ${rootPath} operation should define deprecation and sunset dates in the header if api is marked as deprecated`,
            //path: [...rootPath, "deprecated"],
          });
        } else if (!sunsetKeyFound) {
          results.push({
            message: `Rule ${rule}: The ${rootPath} operation should define sunset date in the header if api is marked as deprecated`,
            //path: [...rootPath, "deprecated"],
          });
        } else if (!deprecatedKeyFound) {
          results.push({
            message: `Rule ${rule}: The ${rootPath} operation should define deprecation date in the header if api is marked as deprecated`,
            //path: [...rootPath, "deprecated"],
          });
        }
      } else {
        results.push({
          message: `Rule ${rule}: The ${rootPath} operation should define deprecation and sunset dates in the header if api is marked as deprecated`,
          //path: [...rootPath, "deprecated"],
        });
      }
    }

    return results;
  },
);
