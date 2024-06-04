// path-summary-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#402"
// given: $[*]
// severity: warn
// then:
//   function: tag-check
//   functionOptions:
//     rule: 402

import { existsSync, readFileSync } from "fs";
import { parse } from "yaml";

export default (targetVal, _opts, context) => {
  const { rule } = _opts;
  let results = [];
  let filePath = "";
  let tagArray = [];

  if (
    context.document.source === undefined ||
    context.document.source === null
  ) {
    console.error("No source file found.");
  } else {
    if (context.document.source.includes("v3")) {
      filePath = "../../sailpoint-api.v3.yaml";
    } else if (context.document.source.includes("beta")) {
      filePath = "../../sailpoint-api.beta.yaml";
    }
  }

  if (existsSync(filePath)) {
    try {
      // Read and parse the YAML file synchronously
      const data = readFileSync(filePath, 'utf8');
      const parsedData = parse(data);
      parsedData.tags.forEach((tag) => {
        tagArray.push(tag.name);
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error(`File ${filePath} does not exist, unable to gather tags from root API spec`);
  }

  for (const [key, value] of Object.entries(targetVal)) {
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

    if(tagArray.length > 0) {
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
};
