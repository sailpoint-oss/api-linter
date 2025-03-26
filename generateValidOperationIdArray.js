import fs from "fs";
import yaml from "js-yaml";

async function getOperationIds(filePaths) {
  const operationIds = new Set();

  for (const filePath of filePaths) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const spec = yaml.load(fileContent);

      if (spec.paths) {
        for (const path in spec.paths) {
          for (const method in spec.paths[path]) {
            if (spec.paths[path][method].operationId) {
              operationIds.add(spec.paths[path][method].operationId);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  return Array.from(operationIds);
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node script.js <file1> <file2> ... <fileN>");
    process.exit(1);
  }

  const uniqueOperationIds = await getOperationIds(args);
  console.log(JSON.stringify(uniqueOperationIds));
})();