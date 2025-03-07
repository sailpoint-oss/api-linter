import { ActionInputs } from "./types.js";

export const getDevInputs = (): ActionInputs => ({
  "github-token": "",
  "file-glob": "../../packages/test-files/sailpoint-api.OpenAPI.yaml,../../packages/test-files/v2024/paths/account.yaml",
  "spectral-root-ruleset": "../../sailpoint-rulesets/root-ruleset.yaml",
  "spectral-path-ruleset": "../../sailpoint-rulesets/path-ruleset.yaml",
  "spectral-schema-ruleset": "../../sailpoint-rulesets/schema-ruleset.yaml",
  "github-url": "",
}); 