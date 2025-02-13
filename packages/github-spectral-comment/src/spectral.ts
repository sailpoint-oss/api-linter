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

const dev =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const __dirname = dev
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
  spectral: typeof Spectral,
  document: any,
  workspace: string,
  ignoreUnknownFormatFlag: boolean
) => {
  core.debug("Linting Document: " + document);
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
