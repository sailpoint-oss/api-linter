// path-must-define-specific-response-codes:
// description: Operation must define at least one 200 level code and the following error codes [400, 401, 403, 429, 500]
// given: $.[*].responses
// severity: error
// then:
//   function: response-validator

// Function to remove single error codes from a set array as we find them in the yaml document
function removeErrorCode(arr: string[], value: string) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

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
  (targetVal: OpenAPIV3.ResponsesObject, options: { rule: string }) => {
    const { rule } = options;
    let error_response_codes = ["400", "401", "403", "429", "500"]; // Error Codes to check
    let contains_2xx_code = false;

    // Loop through each key in the reponses objects. Match the codes exactly,
    // so that a key such as 4001 does not count as 400.
    for (const key of Object.keys(targetVal)) {
      if (/^2(\d\d|XX)$/.test(key)) {
        contains_2xx_code = true;
      }

      removeErrorCode(error_response_codes, key);
    }

    // If the responses have a 2xx level response, but one or more error codes need to be defined
    if (contains_2xx_code == true && error_response_codes.length >= 1) {
      return [
        {
          message: `Rule ${rule}: Operation must have the following error codes defined: ${error_response_codes}`,
        },
      ];
      // If the responses are missing a 2xx level response and one or more error codes need to be defined
    } else if (contains_2xx_code == false && error_response_codes.length >= 1) {
      return [
        {
          message: `Rule ${rule}: Operation must have at least one 200 level response code defined and the following error codes defined: ${error_response_codes}`,
        },
      ];
      // If the responses are missing a 2xx level response, but all required error code responses are defined
    } else if (contains_2xx_code == false && error_response_codes.length == 0) {
      return [
        {
          message: `Rule ${rule}: Operation must have at least one 200 level response code defined`,
        },
      ];
    }
  },
);
