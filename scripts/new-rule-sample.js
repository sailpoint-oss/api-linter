// Creates the sample folder for a lint rule, with a valid.yaml and an
// invalid.yaml to start from. Usage: npm run new-rule-sample -- <rule-name>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const RULESETS = [
  "packages/sailpoint-rulesets/root-ruleset.yaml",
  "packages/sailpoint-rulesets/path-ruleset.yaml",
  "packages/sailpoint-rulesets/schema-ruleset.yaml",
  "packages/sailpoint-rulesets/nerm-path-ruleset.yaml",
  "packages/sailpoint-rulesets/nerm-schema-ruleset.yaml",
  "packages/gateway-rulesets/gateway-ruleset.yaml",
];

const TEMPLATES = {
  root: `openapi: 3.0.3
info:
  title: Sample API
  version: 1.0.0
  x-audience: external-public
tags:
  - name: Identities
paths: {}
`,
  path: `get:
  operationId: getIdentity
  tags:
    - Identities
  summary: Get an identity
  description: Use this API to get a single identity by its ID.
  parameters:
    - in: path
      name: id
      required: true
      schema:
        type: string
      description: The ID of the identity.
      example: 2c9180835d2e5168015d32f890ca1581
  responses:
    "200":
      description: The identity.
`,
  schema: `type: object
required:
  - id
properties:
  id:
    type: string
    description: The ID of the identity.
    example: 2c9180835d2e5168015d32f890ca1581
`,
  gateway: `sp-gateway:
  routes:
    - id: "sample-route-v1"
      path: "/sample-path/v1"
      service: "sample-service"
      routeType: "prefix"
      stripPrefix: true
      stripPrefixPath: "/sample-path/v1"
      apiState: "public"
`,
};

function templateFor(rulesetFile) {
  const name = path.basename(rulesetFile);
  if (name.startsWith("root")) return TEMPLATES.root;
  if (name.startsWith("gateway")) return TEMPLATES.gateway;
  if (name.includes("schema")) return TEMPLATES.schema;
  return TEMPLATES.path;
}

// Returns the YAML block of one rule, or undefined if the ruleset does not have it.
function findRule(rulesetFile, rule) {
  const yaml = fs.readFileSync(path.join(REPO_ROOT, rulesetFile), "utf8");
  const rulesBlock = yaml.split(/^rules:\s*$/m)[1] ?? "";
  const lines = rulesBlock.split("\n");
  const start = lines.findIndex((line) => line === `  ${rule}:`);
  if (start === -1) return undefined;
  const end = lines.findIndex((line, i) => i > start && /^  \S/.test(line));
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

const rule = process.argv[2];
if (!rule) {
  console.error("Usage: npm run new-rule-sample -- <rule-name>");
  process.exit(1);
}

const matches = RULESETS.map((file) => ({ file, block: findRule(file, rule) })).filter((m) => m.block);
if (matches.length === 0) {
  console.error(`No ruleset has a rule named "${rule}".`);
  process.exit(1);
}

for (const { file, block } of matches) {
  const abs = path.join(REPO_ROOT, file);
  const dir = path.join(path.dirname(abs), "samples", path.basename(abs, ".yaml"), rule);
  if (fs.existsSync(dir)) {
    console.log(`Already exists, not changed: ${path.relative(REPO_ROOT, dir)}`);
    continue;
  }

  fs.mkdirSync(dir, { recursive: true });
  const template = templateFor(file);
  fs.writeFileSync(path.join(dir, "valid.yaml"), `# TODO: Make this file pass the "${rule}" rule.\n${template}`);
  fs.writeFileSync(path.join(dir, "invalid.yaml"), `# TODO: Change this file so that it breaks the "${rule}" rule.\n${template}`);

  console.log(`Created ${path.relative(REPO_ROOT, dir)}/valid.yaml and invalid.yaml`);
  console.log(`\nThe rule, from ${file}:\n${block}\n`);
}

console.log(`Run the samples with: npm test -- -t ${rule}`);
