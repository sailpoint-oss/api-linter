import core from "@actions/core";
import spectralCore from "@stoplight/spectral-core";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import { httpAndFileResolver } from "@stoplight/spectral-ref-resolver";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";
import { countReset } from "node:console";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
const { Spectral, Document } = spectralCore;

const dev =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const __dirname = dev
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
  workspace: any,
  ignoreUnknownFormatFlag: any,
) => {
  const documentToLint = new Document(
    document.content,
    Parsers.Yaml,
    path.join(workspace + "/", document.file),
  );

  return spectral.runWithResolved(documentToLint, {
    resolver: httpAndFileResolver,
    ignoreUnknownFormat: ignoreUnknownFormatFlag,
  });
};
