import fs from "fs";
import { globSync } from "glob";
import yaml from "js-yaml";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];

async function getOperationIds(filePaths) {
  const operationIds = new Set();

  for (const filePath of filePaths) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const spec = yaml.load(fileContent);

      if (spec.paths) {
        // Compiled/root spec (e.g. sailpoint-api.yaml, speccy-resolved files):
        // paths.$path.$method.operationId
        for (const path in spec.paths) {
          for (const method in spec.paths[path]) {
            if (spec.paths[path][method].operationId) {
              operationIds.add(spec.paths[path][method].operationId);
            }
          }
        }
      } else {
        // Individual path file (e.g. api-specs/idn/apis/<tag>/paths/*.yaml):
        // $method.operationId at the root of the file
        for (const method of HTTP_METHODS) {
          if (spec[method]?.operationId) {
            operationIds.add(spec[method].operationId);
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
    console.error("Usage: node script.js <glob-or-file> [<glob-or-file> ...]");
    console.error("  Examples:");
    console.error("    node script.js 'api-specs/idn/apis/*/paths/*.yaml'");
    console.error("    node script.js sailpoint-api.yaml");
    process.exit(1);
  }

  const filePaths = args.flatMap((arg) =>
    arg.includes("*") || arg.includes("?") ? globSync(arg) : [arg],
  );

  const uniqueOperationIds = await getOperationIds(filePaths);
  console.log(JSON.stringify(uniqueOperationIds));
})();