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
import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import { devLog, isDev } from "./utils.js";

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
  pbs: { results: ISpectralDiagnostic[] }
): ProcessedPbs => {
  pbs.results.forEach(pb => {
    // Initialize rule array if it doesn't exist
    if (!processedPbs.filteredPbs[pb.code]) {
      core.debug(`Adding rule ${pb.code}`);
      processedPbs.filteredPbs[pb.code] = [];
    }

    // Only add if we haven't seen this exact issue before
    if (!processedPbs.filteredPbs[pb.code].some(existing => 
      existing.source === source &&
      existing.range.start.line === pb.range.start.line &&
      existing.range.start.character === pb.range.start.character
    )) {
      processedPbs.filteredPbs[pb.code].push({
        ...pb,
        source: pb.source || source,
      });
      processedPbs.severitiesCount[pb.severity]++;
    }
  });

  return processedPbs;
};


const __dirname = isDev
  ? path.dirname(fileURLToPath(import.meta.url))
  : path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../packages/sailpoint-rulesets"
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
  spectral: Spectral,
  document: any,
  workspace: string,
  ignoreUnknownFormatFlag: boolean
) => {
  
  core.debug("Linting Document");

  const documentPath = path.join(workspace + "/", document.file);
  core.debug("Document Path: " + documentPath);

  const documentToLint = new Document(
    document.content,
    Parsers.Yaml,
    documentPath
  );

  return spectral.runWithResolved(documentToLint, {
    // resolver: httpAndFileResolver,
    ignoreUnknownFormat: ignoreUnknownFormatFlag,
  });
};
