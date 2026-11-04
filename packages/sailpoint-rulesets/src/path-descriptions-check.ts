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
  (targetVal: string, options: { rule: string }) => {
    const { rule } = options;

    // Match only HTML tag names. Rule 406 allows a template value such as
    // <value>, so a word in angle brackets is not HTML.
    let regex = /<\/?(a|abbr|b|blockquote|br|code|dd|del|div|dl|dt|em|h[1-6]|hr|i|img|li|ol|p|pre|s|small|span|strong|sub|sup|table|tbody|td|th|thead|tr|u|ul)(?=[\s/>])[^>]*>/i;
    if (regex.test(targetVal)) {
      // Contains HTML Tags
      return [
        {
          message: `Rule ${rule}: Descriptions should not contain HTML, please use markdown instead.`,
        },
      ];
    }
  },
);
