// Interactive menu for testing the lint rules. Usage: npm run visual-test
//
// Use the arrow keys to move, Enter to pick, and type to filter long lists.
// Press Ctrl+C at any time to exit.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { select, search, confirm, input, Separator } from "@inquirer/prompts";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ignoreUnknownFormat and inAction match how lint.sh and the PR action run each ruleset.
const RULESETS = [
  { file: "packages/sailpoint-rulesets/root-ruleset.yaml", ignoreUnknownFormat: false, inAction: true },
  { file: "packages/sailpoint-rulesets/path-ruleset.yaml", ignoreUnknownFormat: true, inAction: true },
  { file: "packages/sailpoint-rulesets/schema-ruleset.yaml", ignoreUnknownFormat: true, inAction: true },
  { file: "packages/sailpoint-rulesets/nerm-path-ruleset.yaml", ignoreUnknownFormat: true, inAction: false },
  { file: "packages/sailpoint-rulesets/nerm-schema-ruleset.yaml", ignoreUnknownFormat: true, inAction: false },
  { file: "packages/gateway-rulesets/gateway-ruleset.yaml", ignoreUnknownFormat: true, inAction: true },
].map((r) => {
  const name = path.basename(r.file, ".yaml");
  return { ...r, name, samplesDir: path.join(REPO_ROOT, path.dirname(r.file), "samples", name) };
});

const GATEWAY_ROUTES_FILE = "packages/gateway-rulesets/samples/sp-gateway-routes.yaml";
const SAMPLE_FILE = /^(valid|invalid)([-_.].*)?\.ya?ml$/;
const PAGE_SIZE = 15;

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

// ---------- Rules and samples ----------

function loadRules(ruleset) {
  const yaml = fs.readFileSync(path.join(REPO_ROOT, ruleset.file), "utf8");
  const lines = (yaml.split(/^rules:\s*$/m)[1] ?? "").split("\n");
  const rules = [];
  lines.forEach((line, i) => {
    const match = line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
    if (!match) return;
    const block = [];
    for (let j = i + 1; j < lines.length && !/^  \S/.test(lines[j]); j++) block.push(lines[j]);
    // Many rules only have a message template such as "{{error}}: <guideline link>",
    // so fall back to the guideline number from the link.
    const text = block.join("\n");
    const description = text.match(/^\s+description:\s*"?(.*?)"?\s*$/m)?.[1]?.replace(/:? ?https?:\/\/\S+/, "");
    const guideline = text.match(/guidelines\/#(\d+)/)?.[1];
    rules.push({
      name: match[1],
      description: description || (guideline ? `API guideline #${guideline}` : ""),
      ruleset,
    });
  });
  return rules;
}

function listSamples(rule) {
  const dir = path.join(rule.ruleset.samplesDir, rule.name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((name) => SAMPLE_FILE.test(path.basename(name)))
    .sort()
    .map((name) => path.relative(REPO_ROOT, path.join(dir, name)));
}

const allRules = () => RULESETS.flatMap(loadRules);

// ---------- Build ----------

function newestMtime(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  let newest = 0;
  for (const name of fs.readdirSync(dir, { recursive: true })) {
    if (name.includes("node_modules") || !name.endsWith(ext)) continue;
    newest = Math.max(newest, fs.statSync(path.join(dir, name)).mtimeMs);
  }
  return newest;
}

// The rulesets load compiled code, so build when a source file is newer than its build.
function buildIfNeeded() {
  const packages = [
    ["packages/sailpoint-rulesets/src", "packages/sailpoint-rulesets/functions"],
    ["packages/gateway-rulesets/src", "packages/gateway-rulesets/functions"],
    ["packages/github-spectral-comment/src", "packages/github-spectral-comment/dist"],
  ];
  const stale = packages.some(
    ([src, out]) => newestMtime(path.join(REPO_ROOT, src), ".ts") > newestMtime(path.join(REPO_ROOT, out), ".js"),
  );
  if (!stale) return true;
  console.log(dim("\nSource code changed since the last build. Building..."));
  // Run tsc for each package, as `pnpm build` does. Some pnpm installs are
  // shell aliases that Node cannot start directly.
  for (const [src] of packages) {
    const result = spawnSync("npx", ["tsc", "-p", path.dirname(src)], { cwd: REPO_ROOT, stdio: "inherit" });
    if (result.status !== 0) {
      console.log(red(`The build of ${path.dirname(src)} failed.`));
      return false;
    }
  }
  return true;
}

function run(command, args, { env = {}, cwd = REPO_ROOT } = {}) {
  console.log(dim(`\n$ ${[...Object.entries(env).map(([k, v]) => `${k}=${v}`), command, ...args].join(" ")}\n`));
  const result = spawnSync(command, args, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
  if (result.error) console.log(red(`Could not run ${command}: ${result.error.message}`));
  return result;
}

// ---------- Pickers ----------

async function pickRuleset(message, { includeAll = false, onlyInAction = false } = {}) {
  const choices = RULESETS.filter((r) => !onlyInAction || r.inAction).map((r) => ({
    name: r.name,
    value: r,
    description: `${loadRules(r).length} rules`,
  }));
  if (includeAll) choices.unshift({ name: "All rulesets", value: "all" });
  return select({ message, choices, pageSize: PAGE_SIZE });
}

function ruleLabel(rule) {
  const count = listSamples(rule).length;
  const status = count > 0 ? green(`${count} samples`) : red("no samples");
  return `${rule.name} ${dim(`(${status}${dim(")")}`)}`;
}

async function pickRule(rules, message, { includeAll = false } = {}) {
  return search({
    message: `${message} ${dim("(type to filter)")}`,
    pageSize: PAGE_SIZE,
    source: (term) => {
      const matches = rules
        .filter((r) => !term || r.name.includes(term.toLowerCase()))
        .map((r) => ({ name: ruleLabel(r), value: r, description: r.description }));
      return includeAll && !term ? [{ name: bold("All rules"), value: "all" }, ...matches] : matches;
    },
  });
}

async function pickSample(rule) {
  const samples = listSamples(rule);
  if (samples.length === 0) {
    console.log(red(`\n${rule.name} has no samples yet. Use "Add samples for a rule" first.`));
    return undefined;
  }
  const dir = path.relative(REPO_ROOT, path.join(rule.ruleset.samplesDir, rule.name));
  return select({
    message: "Which sample?",
    pageSize: PAGE_SIZE,
    choices: samples.map((file) => {
      const firstLine = fs.readFileSync(path.join(REPO_ROOT, file), "utf8").split("\n")[0];
      return {
        name: path.relative(dir, file),
        value: file,
        description: firstLine.startsWith("#") ? firstLine.replace(/^#\s*/, "") : undefined,
      };
    }),
  });
}

// ---------- Actions ----------

async function testWithSamples() {
  const ruleset = await pickRuleset("Which ruleset?", { includeAll: true });
  let pattern;
  if (ruleset !== "all") {
    const rule = await pickRule(loadRules(ruleset), "Which rule?", { includeAll: true });
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = `^${escape(ruleset.name)}\\.yaml ` + (rule === "all" ? "" : `${escape(rule.name)} `);
  }
  const output = await select({
    message: "How much output?",
    choices: [
      { name: "Summary", value: "default", description: "Show failures and the totals" },
      { name: "Every test", value: "verbose", description: "Show each sample, and rules with no samples as todo" },
    ],
  });
  if (!buildIfNeeded()) return;
  const args = ["vitest", "run", "test/rule-samples.test.ts", "--silent", `--reporter=${output}`];
  // The filter skips the other tests. Hide them so that only the tests that ran are shown.
  if (pattern) args.push("-t", pattern, "--hideSkippedTests");
  run("npx", args);
}

async function lintOneSample() {
  const ruleset = await pickRuleset("Which ruleset?");
  const rule = await pickRule(loadRules(ruleset), "Which rule?");
  const file = await pickSample(rule);
  if (!file || !buildIfNeeded()) return;
  const args = ["spectral", "lint", file, "--ruleset", ruleset.file];
  if (ruleset.ignoreUnknownFormat) args.push("--ignore-unknown-format");
  run("npx", args);
  console.log(dim(`Problems from "${rule.name}" are the ones this sample tests. Other rules can also report problems.`));
}

async function previewPrComment() {
  const files = [];
  while (true) {
    const source = await select({
      message: files.length === 0 ? "Which file do you want in the PR comment?" : "Add another file?",
      choices: [
        ...(files.length > 0 ? [{ name: bold("No, make the comment now"), value: "done" }] : []),
        { name: "A rule sample", value: "sample" },
        { name: "The gateway routes file", value: "gateway", description: GATEWAY_ROUTES_FILE },
        { name: "A file path that I type", value: "type" },
      ],
    });
    if (source === "done") break;
    if (source === "gateway") files.push(GATEWAY_ROUTES_FILE);
    if (source === "sample") {
      const ruleset = await pickRuleset("Which ruleset?", { onlyInAction: true });
      const file = await pickSample(await pickRule(loadRules(ruleset), "Which rule?"));
      if (file) files.push(file);
    }
    if (source === "type") {
      const typed = await input({
        message: "File path, relative to the repo root:",
        validate: (p) => fs.existsSync(path.join(REPO_ROOT, p)) || "That file does not exist.",
      });
      files.push(typed);
    }
    console.log(dim(`Files so far: ${files.join(", ")}`));
  }

  if (!buildIfNeeded()) return;
  // The same command as `pnpm --filter github-spectral-comment test`.
  const result = run("node", ["dist/index.js"], {
    env: { NODE_ENV: "test", FILE_GLOB: files.join(",") },
    cwd: path.join(REPO_ROOT, "packages/github-spectral-comment"),
  });
  const outputFile = path.join(REPO_ROOT, "packages/github-spectral-comment/output.md");
  if (result.status === 0 && fs.existsSync(outputFile)) {
    console.log(bold("\n---------- PR comment ----------\n"));
    console.log(fs.readFileSync(outputFile, "utf8"));
    console.log(dim(`Saved to ${path.relative(REPO_ROOT, outputFile)}. Open it in a Markdown preview to see it as GitHub shows it.`));
  }
}

async function addSamples() {
  const rules = allRules();
  const missing = rules.filter((r) => listSamples(r).length === 0);
  const rule = await pickRule(missing.length > 0 ? [...missing, ...rules.filter((r) => !missing.includes(r))] : rules,
    "Which rule needs samples? Rules with no samples are at the top.");
  run("node", ["scripts/new-rule-sample.js", rule.name]);
}

function showCoverage() {
  console.log();
  for (const ruleset of RULESETS) {
    const rules = loadRules(ruleset);
    const missing = rules.filter((r) => listSamples(r).length === 0);
    const done = rules.length - missing.length;
    const status = missing.length === 0 ? green(`${done}/${rules.length}`) : red(`${done}/${rules.length}`);
    console.log(`${bold(ruleset.name.padEnd(22))} ${status} rules have samples`);
    missing.forEach((r) => console.log(dim(`    no samples: ${r.name}`)));
  }
}

async function runAllTests() {
  if (!buildIfNeeded()) return;
  run("npx", ["vitest", "run", "--silent"]);
}

// ---------- Main menu ----------

const ACTIONS = [
  { name: "Test rules with their samples", value: testWithSamples, description: "Pass or fail for each sample, for one rule, one ruleset, or all rules" },
  { name: "Lint one sample with Spectral", value: lintOneSample, description: "See every problem that Spectral reports for one sample file" },
  { name: "Preview the PR comment", value: previewPrComment, description: "Make the GitHub PR comment for the files you pick" },
  new Separator(),
  { name: "Add samples for a rule", value: addSamples, description: "Make valid.yaml and invalid.yaml starter files for a rule" },
  { name: "Show which rules have samples", value: showCoverage, description: "List the rules in each ruleset that have no samples" },
  { name: "Run all tests", value: runAllTests, description: "Run every unit test and sample test" },
  new Separator(),
  { name: "Exit", value: null },
];

async function main() {
  console.log(bold("\nAPI linter rule tester"));
  console.log(dim("Arrow keys to move, Enter to pick, type to filter lists, Ctrl+C to exit.\n"));
  while (true) {
    const action = await select({ message: "What do you want to do?", choices: ACTIONS, pageSize: PAGE_SIZE });
    if (!action) return;
    await action();
    console.log();
    if (!(await confirm({ message: "Back to the main menu?", default: true }))) return;
  }
}

main().catch((error) => {
  // Ctrl+C in a prompt throws ExitPromptError. Exit with no stack trace.
  if (error?.name === "ExitPromptError") process.exit(0);
  throw error;
});
