import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import spectralRuntime from "@stoplight/spectral-runtime";
import { httpAndFileResolver, Resolver } from '@stoplight/spectral-ref-resolver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const { fetch } = spectralRuntime;

export const createSpectral = async (rulesetFilePath) => {
    const spectral = new Spectral({resolver: httpAndFileResolver});
    
    spectral.setRuleset(await bundleAndLoadRuleset(path.join(__dirname, rulesetFilePath), { fs, fetch }));

    return spectral;
};

export const runSpectral = async (spectral, document, workspace, ignoreUnknownFormatFlag) => {

    const documentToLint = new Document(document.content, Parsers.Yaml, path.join(workspace + "/", document.file));
    
    return spectral.runWithResolved(documentToLint, {
        resolver: httpAndFileResolver,
        ignoreUnknownFormat: ignoreUnknownFormatFlag
    });
}