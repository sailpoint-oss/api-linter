// Runs every ruleset against the sample files for each of its rules.
//
// Layout: <package>/samples/<ruleset-name>/<rule-name>/
//   valid*.yaml   - the rule must NOT report a problem
//   invalid*.yaml - the rule MUST report at least one problem
//
// See packages/sailpoint-rulesets/samples/README.md for details.
// Run `pnpm build` first: the rulesets load the compiled functions/ folder.

import { describe, test, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import spectralCore, { ISpectralDiagnostic } from "@stoplight/spectral-core";
import Parsers from "@stoplight/spectral-parsers";
import { createHttpAndFileResolver } from "@stoplight/spectral-ref-resolver";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";

const { Spectral, Document } = spectralCore;
const { fetch } = spectralRuntime;

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Each ruleset and how it is run in lint.sh. Path and schema files are
// fragments, not full OpenAPI documents, so they ignore the unknown format.
const RULESETS = [
  { file: "packages/sailpoint-rulesets/root-ruleset.yaml", ignoreUnknownFormat: false },
  { file: "packages/sailpoint-rulesets/path-ruleset.yaml", ignoreUnknownFormat: true },
  { file: "packages/sailpoint-rulesets/schema-ruleset.yaml", ignoreUnknownFormat: true },
  { file: "packages/sailpoint-rulesets/nerm-path-ruleset.yaml", ignoreUnknownFormat: true },
  { file: "packages/sailpoint-rulesets/nerm-schema-ruleset.yaml", ignoreUnknownFormat: true },
  { file: "packages/gateway-rulesets/gateway-ruleset.yaml", ignoreUnknownFormat: true },
];

const SAMPLE_FILE = /^(valid|invalid)([-_.].*)?\.ya?ml$/;

function samplesDirFor(rulesetFile: string): string {
  const abs = path.join(REPO_ROOT, rulesetFile);
  return path.join(path.dirname(abs), "samples", path.basename(abs, path.extname(abs)));
}

// Samples can sit in subfolders, for rules that look at the file path
// (for example <rule>/v3/schemas/invalid.yaml).
function listSampleFiles(ruleDir: string) {
  if (!fs.existsSync(ruleDir)) return [];
  return (fs.readdirSync(ruleDir, { recursive: true }) as string[])
    .filter((name) => SAMPLE_FILE.test(path.basename(name)))
    .sort()
    .map((name) => ({
      name: name.split(path.sep).join("/"),
      file: path.join(ruleDir, name),
      expectProblem: path.basename(name).startsWith("invalid"),
    }));
}

function format(results: ISpectralDiagnostic[]): string {
  if (results.length === 0) return "  (no results)";
  return results
    .map((r) => `  ${r.range.start.line + 1}:${r.range.start.character + 1} ${r.code} - ${r.message}`)
    .join("\n");
}

// The rule names must be known when the tests are collected, so read them
// from the ruleset YAML here. The ruleset itself is loaded in beforeAll.
function ruleNames(rulesetFile: string): string[] {
  const yaml = fs.readFileSync(path.join(REPO_ROOT, rulesetFile), "utf8");
  const rulesBlock = yaml.split(/^rules:\s*$/m)[1] ?? "";
  return [...rulesBlock.matchAll(/^  ([A-Za-z0-9_-]+):\s*$/gm)].map((m) => m[1]);
}

for (const ruleset of RULESETS) {
  const samplesDir = samplesDirFor(ruleset.file);

  describe(path.basename(ruleset.file), () => {
    let spectral: InstanceType<typeof Spectral>;

    beforeAll(async () => {
      spectral = new Spectral({ resolver: createHttpAndFileResolver() });
      spectral.setRuleset(
        await bundleAndLoadRuleset(path.join(REPO_ROOT, ruleset.file), { fs, fetch }),
      );
    });

    const rules = ruleNames(ruleset.file);

    // A sample folder for a rule that does not exist is a typo or a removed rule.
    test("every sample folder matches a rule", () => {
      const folders = fs.existsSync(samplesDir)
        ? fs.readdirSync(samplesDir).filter((d) => fs.statSync(path.join(samplesDir, d)).isDirectory())
        : [];
      expect(folders.filter((d) => !rules.includes(d))).toEqual([]);
    });

    for (const rule of rules) {
      const samples = listSampleFiles(path.join(samplesDir, rule));

      if (samples.length === 0) {
        test.todo(`${rule} (no samples yet)`);
        continue;
      }

      describe(rule, () => {
        for (const sample of samples) {
          const label = sample.expectProblem ? "reports a problem" : "reports no problem";

          test(`${sample.name} ${label}`, async () => {
            const content = fs.readFileSync(sample.file, "utf8");
            const results = await spectral.run(new Document(content, Parsers.Yaml, sample.file), {
              ignoreUnknownFormat: ruleset.ignoreUnknownFormat,
            });

            const parseErrors = results.filter((r) => r.code === "parser");
            expect(parseErrors, `YAML errors in ${sample.file}:\n${format(parseErrors)}`).toEqual([]);

            const hits = results.filter((r) => r.code === rule);
            const detail = `${sample.file}\nAll results:\n${format(results)}`;
            if (sample.expectProblem) {
              expect(hits.length, `Expected "${rule}" to report a problem.\n${detail}`).toBeGreaterThan(0);
            } else {
              expect(hits.length, `Expected "${rule}" to report no problem.\n${detail}`).toBe(0);
            }
          });
        }
      });
    }
  });
}
