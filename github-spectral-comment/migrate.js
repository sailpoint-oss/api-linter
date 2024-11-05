// spectralMigrator.js

import { migrateRuleset } from "@stoplight/spectral-ruleset-migrator";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
try {
  const sourcePath = path.join(__dirname, "./api-linter/path-ruleset.yaml");
  const targetPath = path.join(__dirname, ".spectral.js");

  await migrateRuleset(sourcePath, {
    fs,
    format: "commonjs", // esm available too, but not recommended for now
  }).then(fs.promises.writeFile.bind(fs.promises, targetPath));

  console.log("Ruleset migration completed successfully.");
} catch (error) {
  console.error("An error occurred during ruleset migration:", error);
}
