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

    // Matches Docusaurus/MDX variable interpolation syntax, e.g. ${your_identity_id}
    const docusaurusVarRegex = /\$\{[^}]+\}/g;

    const foundVariables: string[] = [];

    function eachRecursive(obj: any) {
      for (const k in obj) {
        if (typeof obj[k] === "object" && obj[k] !== null) {
          eachRecursive(obj[k]);
        } else if (typeof obj[k] === "string") {
          const matches = obj[k].match(docusaurusVarRegex);
          if (matches) {
            matches.forEach((match: string) => {
              if (!foundVariables.includes(match)) {
                foundVariables.push(match);
              }
            });
          }
        }
      }
    }

    eachRecursive(targetVal);

    if (foundVariables.length > 0) {
      return [
        {
          message: `Rule ${rule}: Docusaurus variable syntax is not allowed in API specs. Found: [${foundVariables.join(", ")}]. This syntax causes Docusaurus to crash when the variable is not defined.`,
        },
      ];
    }
  },
);
