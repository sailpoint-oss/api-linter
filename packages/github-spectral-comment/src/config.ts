import { ActionInputs } from "./types.js";

// Files linted in dev mode, relative to the repo root. Set FILE_GLOB to a
// comma-separated list of files to lint other files.
const DEFAULT_DEV_FILES = [
  "packages/sailpoint-rulesets/samples/root-ruleset/root-tags-must-be-in-alphabetical-order/invalid.yaml",
  "packages/sailpoint-rulesets/samples/path-ruleset/path-tag-check/invalid.yaml",
  "packages/sailpoint-rulesets/samples/schema-ruleset/schema-properties-must-have-description/invalid.yaml",
  "packages/gateway-rulesets/samples/sp-gateway-routes.yaml",
].join(",");

export const getDevInputs = (): ActionInputs => ({
  "github-token": "",
  "file-glob": process.env.FILE_GLOB || DEFAULT_DEV_FILES,
  "spectral-root-ruleset": "../../sailpoint-rulesets/root-ruleset.yaml",
  "spectral-path-ruleset": "../../sailpoint-rulesets/path-ruleset.yaml",
  "spectral-schema-ruleset": "../../sailpoint-rulesets/schema-ruleset.yaml",
  "spectral-gateway-ruleset": "../../gateway-rulesets/gateway-ruleset.yaml",
  "github-url": "",
});
