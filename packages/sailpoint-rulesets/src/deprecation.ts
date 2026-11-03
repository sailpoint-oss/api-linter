// Checks that a deprecated operation adds the Deprecation and Sunset headers
// to its success responses.
//
// path-deprecated-apis-should-have-deprecation-and-sunset-dates:
//   given: $[get,put,post,patch,delete,head,options]
//   then:
//     function: deprecation
//     functionOptions:
//       rule: 189

import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { OpenAPIV3 } from "openapi-types";

const HEADERS = ["deprecation", "sunset"];

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
  (targetVal: OpenAPIV3.OperationObject, options: { rule: string }, context) => {
    const { rule } = options;
    if (!targetVal || typeof targetVal !== "object" || targetVal.deprecated !== true) return;

    const basePath = context?.path ?? [];
    const results = [];
    for (const [code, response] of Object.entries(targetVal.responses ?? {})) {
      if (!/^2/.test(code) || !response || typeof response !== "object") continue;

      const headers = Object.keys((response as OpenAPIV3.ResponseObject).headers ?? {}).map((name) => name.toLowerCase());
      const missing = HEADERS.filter((header) => !headers.includes(header.toLowerCase()));
      if (missing.length > 0) {
        results.push({
          message: `Rule ${rule}: The operation is deprecated, so the ${code} response should define the ${missing.join(" and ")} header${missing.length > 1 ? "s" : ""}`,
          path: [...basePath, "responses", code],
        });
      }
    }
    return results;
  },
);
