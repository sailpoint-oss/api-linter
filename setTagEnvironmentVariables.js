// preloadTags.js
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");

const startDir = "../api-specs/src/main/yaml";
const fileName = process.argv[2];
const fileContents = findAndReadFile(startDir, fileName);

if (fileContents !== null) {
  const parsedData = yaml.parse(fileContents);
  // Output JSON string only, no other logs
  console.log(JSON.stringify(parsedData.tags.map((tag) => tag.name)));
} else {
  console.error(`${fileName} file not found in any parent directories.`);
  process.exit(1);
}

function findAndReadFile(startDir, targetFile) {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const filePath = path.join(currentDir, targetFile);

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      return fileContents;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}
