// Checks that a list operation returns an object, and not a top-level array
// (rule 110). It's set as a warning because most of our operations currently return an array
// but the desire is for new APIs to conform to the rule
//
// path-list-operations-must-return-object:
//   given: $.get
//   then:
//     function: list-response-check
//     functionOptions:
//       rule: 110

import { RulesetFunctionContext } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

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
  (targetVal: OpenAPIV3.OperationObject, options: { rule: string }, context?: RulesetFunctionContext) => {
    const { rule } = options;
    if (!targetVal || typeof targetVal !== "object") return [];

    const response = targetVal.responses?.["200"];
    const content = response && "content" in response ? response.content ?? {} : {};
    const returnsArray = Object.entries(content).some(
      ([mediaType, media]) =>
        /^application\/(.+\+)?json\b/.test(mediaType) &&
        media.schema != null &&
        "type" in media.schema &&
        media.schema.type === "array",
    );
    if (!returnsArray) return [];

    // Report the operation, not the schema. The schema can be in a referenced
    // file, and then an x-sailpoint-lint-ignore on the operation does not
    // reach the result.
    return [
      {
        message: `Rule ${rule}: This list operation returns a top-level array. In the next version of this API, return an object with an items array. A new list operation must return an object`,
        path: [...(context?.path ?? [])],
      },
    ];
  },
);
