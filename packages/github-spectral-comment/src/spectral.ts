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
    
    const key = `${pb.code}_${source}_${pb.range.start.line}_${pb.range.start.character}`;
    const ruleCode = pb.code;

    // Initialize rule array if it doesn't exist
    if (!processedPbs.filteredPbs[ruleCode]) {
      processedPbs.filteredPbs[ruleCode] = [];
    }

    // Only add if we haven't seen this exact issue before
    if (!processedPbs.filteredPbs[ruleCode].some(existing => 
      existing.source === source &&
      existing.range.start.line === pb.range.start.line &&
      existing.range.start.character === pb.range.start.character
    )) {
      processedPbs.filteredPbs[ruleCode].push({
        ...pb,
        source: pb.source || source,
      });
      processedPbs.severitiesCount[pb.severity]++;
    }
  });

  devLog(processedPbs.filteredPbs);

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
  spectral: any,
  document: any,
  workspace: string,
  ignoreUnknownFormatFlag: boolean
) => {
  
  core.debug("Linting Document");

  const documentToLint = new Document(
    document.content,
    Parsers.Yaml,
    path.join(workspace + "/", document.file)
  );

  return spectral.runWithResolved(documentToLint, {
    resolver: httpAndFileResolver,
    ignoreUnknownFormat: ignoreUnknownFormatFlag,
  });
};
