import core from "@actions/core";
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import { httpAndFileResolver } from "@stoplight/spectral-ref-resolver";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ISpectralDiagnostic } from "@stoplight/spectral-core";
import { devLog, isDev } from "./utils.js";
import { isGatewayRoutesPath } from "./diff.js";

interface ProcessedPbs {
  filteredPbs: {
    [ruleCode: string]: Array<ISpectralDiagnostic & { source: string }>;
  };
  severitiesCount: Record<number, number>;
}

export const initProcessedPbs = (): ProcessedPbs => ({
  filteredPbs: {},
  severitiesCount: {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  },
});

export const processPbs = (
  source: string,
  processedPbs: ProcessedPbs,
  pbs: { results: ISpectralDiagnostic[] },
): ProcessedPbs => {
  pbs.results.forEach((pb) => {
    // Initialize rule array if it doesn't exist
    if (!processedPbs.filteredPbs[pb.code]) {
      core.debug(`Adding rule ${pb.code}`);
      processedPbs.filteredPbs[pb.code] = [];
    }

    // Only add if we haven't seen this exact issue before
    if (
      !processedPbs.filteredPbs[pb.code].some(
        (existing) =>
          existing.source === source &&
          existing.range.start.line === pb.range.start.line &&
          existing.range.start.character === pb.range.start.character,
      )
    ) {
      processedPbs.filteredPbs[pb.code].push({
        ...pb,
        source: pb.source || source,
      });
      processedPbs.severitiesCount[pb.severity]++;
    }
  });

  return processedPbs;
};

/**
 * Scope the gateway routes file to a PR's changed lines: drop its findings that
 * are not on added/edited lines so that pre-existing violations on untouched
 * routes are ignored. Every other file passes through unchanged. The returned
 * object has a freshly recomputed severitiesCount so the pass/fail gate matches
 * what is reported.
 *
 * `changedLinesByFile` comes from getChangedLinesForPr: a `null` value means the
 * gateway file changed but its specific lines are unknown (no patch), so its
 * findings are kept as-is; a missing entry means the file was not changed, so
 * all of its findings are dropped.
 */
export const filterGatewayToChangedLines = (
  processedPbs: ProcessedPbs,
  changedLinesByFile: Map<string, Set<number> | null>,
): ProcessedPbs => {
  const gatewayEntry = [...changedLinesByFile.entries()].find(([file]) =>
    isGatewayRoutesPath(file),
  );
  const gatewayFileChanged = gatewayEntry !== undefined;
  const changedLines = gatewayEntry?.[1] ?? null;

  const filtered = initProcessedPbs();

  for (const [code, issues] of Object.entries(processedPbs.filteredPbs)) {
    for (const issue of issues) {
      let keep = true;

      if (isGatewayRoutesPath(issue.source)) {
        if (!gatewayFileChanged) {
          keep = false; // file not touched in this PR — nothing to report
        } else if (changedLines === null) {
          keep = true; // changed but no patch available — keep everything
        } else {
          keep = changedLines.has(issue.range.start.line + 1);
        }
      }

      if (keep) {
        if (!filtered.filteredPbs[code]) {
          filtered.filteredPbs[code] = [];
        }
        filtered.filteredPbs[code].push(issue);
        filtered.severitiesCount[issue.severity]++;
      }
    }
  }

  return filtered;
};

const __dirname = isDev
  ? path.dirname(fileURLToPath(import.meta.url))
  : path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../packages/sailpoint-rulesets",
    );

const { fetch } = spectralRuntime;

export const createSpectral = async (rulesetFilePath: string) => {
  const spectral = new Spectral({ resolver: httpAndFileResolver });

  const rulesetPath = path.join(__dirname, rulesetFilePath);
  core.debug("Ruleset Path: " + rulesetPath);

  spectral.setRuleset(await bundleAndLoadRuleset(rulesetPath, { fs, fetch }));

  return spectral;
};

export const runSpectral = async (
  spectral: any,
  document: any,
  workspace: string,
  ignoreUnknownFormatFlag: boolean,
) => {
  core.debug("Linting Document");

  const documentPath = path.join(workspace + "/", document.file);
  core.debug("Document Path: " + documentPath);

  const documentToLint = new Document(
    document.content,
    Parsers.Yaml,
    documentPath,
  );

  return spectral.runWithResolved(documentToLint, {
    resolver: httpAndFileResolver,
    ignoreUnknownFormat: ignoreUnknownFormatFlag,
  });
};
