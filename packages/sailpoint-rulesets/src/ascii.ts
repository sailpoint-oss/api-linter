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
  (targetVal: any, options: { rule: string }) => {
    const { rule } = options;

    // ASCII Character Regex
    const ascii = /[^\x00-\x7F]/gm;

    // Array of ASCII Characters
    let asciiCharacters: string[] = [];

    function eachRecursive(obj: any) {
      for (var k in obj) {
        if (typeof obj[k] == "object" && obj[k] !== null) {
          eachRecursive(obj[k]);
        } else {
          if (ascii.test(obj[k])) {
            let matches = obj[k].match(/[^\x00-\x7F]/g);
            matches.forEach((element: string) => {
              asciiCharacters.push(element);
            });
          }
        }
      }
    }

    eachRecursive(targetVal);

    if (asciiCharacters.length > 0) {
      return [
        {
          message: `Rule ${rule}: There are non-ascii characters present within the file [${asciiCharacters}]`,
        },
      ];
    }
  },
);
