// path-summary-check:
// message: "{{error}}: https://sailpoint-oss.github.io/sailpoint-api-guidelines/#402"
// given: $[*]
// severity: warn
// then:
//   function: tag-check
//   functionOptions:
//     rule: 402
module.exports = (targetVal, _opts, context) => { 

  function findAndReadFile(startDir, targetFile) {
    let currentDir = startDir;
  
    while (currentDir !== path.parse(currentDir).root) {
      const filePath = path.join(currentDir, targetFile);
  
      // Check if the file exists at this level
      if (fs.existsSync(filePath)) {
        console.log(`File found at: ${filePath}`);
        
        // Read and return file contents
        const fileContents = fs.readFileSync(filePath, "utf8");
        return fileContents;
      }
  
      // Move up one directory level
      currentDir = path.dirname(currentDir);
    }
  
    console.error(`File ${targetFile} not found in any parent directories.`);
    return null;
  }


  const fs = require("fs");
  const path = require("path");
  const yaml = require("yaml");

  const { rule } = _opts;
  let results = [];
  let tagArray = [];
  let rootFileContents = "";
  
  if (
    context.document.source === undefined ||
    context.document.source === null
  ) {
    console.error("No source file found.");
  } else {
    if (context.document.source.includes("v3")) {
      rootFileContents = findAndReadFile(process.cwd(), "sailpoint-api.v3.yaml");
    } else if (context.document.source.includes("v2024")) {
      rootFileContents = findAndReadFile(process.cwd(), "sailpoint-api.v2024.yaml");
    } else if (context.document.source.includes("beta")) {
      rootFileContents = findAndReadFile(process.cwd(), "sailpoint-api.beta.yaml");
    }
  }

  if (rootFileContents !== null) {
      const parsedData = yaml.parse(rootFileContents);
      parsedData.tags.forEach((tag) => {
        tagArray.push(tag.name);
      });
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

