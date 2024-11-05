// path-summary-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#402"
// given: $[*]
// severity: warn
// then:
//   function: tag-check
//   functionOptions:
//     rule: 402

import pkg from '@stoplight/spectral-core';
const { createRulesetFunction } = pkg;

export default createRulesetFunction(
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
  (targetVal, options, context) => {
  const { rule } = options;
  let results = [];
  let tagArray = [];
  
  console.log(targetVal)

  if (
    context.document.source === undefined ||
    context.document.source === null
  ) {
    console.error("No source file found.");
  } else {
    if (context.document.source.includes("v3")) {
      const preloadedTags = process.env.V3_TAGS_JSON;
      if (preloadedTags) {
        tagArray = JSON.parse(preloadedTags);
      } else {
        console.error(
          "Preloaded Beta tags data not found in environment, this will not run the tags check."
        );
      }
    } else if (context.document.source.includes("v2024")) {
      const preloadedTags = process.env.V2024_TAGS_JSON;
      if (preloadedTags) {
        tagArray = JSON.parse(preloadedTags);
      } else {
        console.error(
          "Preloaded Beta tags data not found in environment, this will not run the tags check."
        );
      }
    } else if (context.document.source.includes("beta")) {
      const preloadedTags = process.env.BETA_TAGS_JSON;
      if (preloadedTags) {
        tagArray = JSON.parse(preloadedTags);
      } else {
        console.error(
          "Preloaded Beta tags data not found in environment, this will not run the tags check."
        );
      }
    }
  }

  for (const [key, value] of Object.entries(targetVal)) {
    console.log(`key: ${key}, value: ${value.tags}`);
    if (value.tags === undefined || value.tags == null) {
      results.push({
        message: `Rule ${rule}: You must include one tag to group an endpoint under`,
        path: [key, "tags"],
      });
    } else if (value.tags.length > 1) {
      results.push({
        message: `Rule ${rule}: You must include only one tag to group an endpoint under`,
        path: [key, "tags"],
      });
    }

    if (tagArray.length > 0) {
      value.tags.forEach((tag) => {
        if (!tagArray.includes(tag)) {
          results.push({
            message: `Rule ${rule}: Tag "${tag}" is not defined in the root API spec`,
            path: [key, "tags"],
          });
        }
      });
    }
  }

  return results;
});