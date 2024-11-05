import fs from "fs";
import path from "path";
import yaml from "yaml";
import { fileURLToPath } from "url";

const startDir = new URL("./api-specs/src/main/yaml", import.meta.url);
const fileName = process.argv[2];
const fileContents = await findAndReadFile(startDir, fileName);

if (fileContents !== null) {
  const parsedData = yaml.parse(fileContents);
  console.log(JSON.stringify(parsedData.tags.map((tag) => tag.name)));
} else {
  console.error(`${fileName} file not found in any parent directories.`);
  process.exit(1);
}

async function findAndReadFile(startDir, targetFile) {
  let currentDir = startDir;

  while (currentDir.pathname !== "/") {
    const filePath = path.join(fileURLToPath(currentDir), targetFile);

    if (fs.existsSync(filePath)) {
      const fileContents = await fs.promises.readFile(filePath, "utf8");
      return fileContents;
    }

    currentDir = new URL("..", currentDir);
  }

  return null;
}
