// Checks that the standard error responses use the shared response files.
// The rule must set resolved: false, so that the function sees the $ref.
//
// path-error-responses-should-use-shared-responses:
//   resolved: false
//   given: $[get,put,post,patch,delete,head,options].responses
//   then:
//     function: error-response-ref-check
//     functionOptions:
//       rule: 151
//
// In the apis/ folder, the shared files are in apis/shared/responses/. The
// v3/responses/ folder is deprecated, so files in apis/ must not use it.

import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

const SHARED_CODES = ["400", "401", "403", "404", "429", "500"];

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
  (targetVal: Record<string, unknown>, options: { rule: string }, context) => {
    const { rule } = options;
    if (!targetVal || typeof targetVal !== "object") return;

    const source = context?.document?.source ?? "";
    const inApis = /(^|\/)apis\//.test(source);
    const basePath = context?.path ?? [];
    const results = [];

    for (const code of SHARED_CODES) {
      const response = targetVal[code] as { $ref?: unknown } | undefined;
      if (!response || typeof response !== "object") continue;

      const ref = typeof response.$ref === "string" ? response.$ref : undefined;
      if (!ref) {
        results.push({
          message: `Rule ${rule}: The ${code} response is defined inline. Use $ref to the shared ${code}.yaml response file`,
          path: [...basePath, code],
        });
      } else if (inApis && /(^|\/)v3\/responses\//.test(ref)) {
        results.push({
          message: `Rule ${rule}: The ${code} response refers to the deprecated v3/responses/ folder. Use apis/shared/responses/${code}.yaml`,
          path: [...basePath, code, "$ref"],
        });
      }
    }
    return results;
  },
);
