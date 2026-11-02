// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";
import {Route} from "./types.js";
import path from "path";
import core from "@actions/core";
import * as yaml from 'js-yaml';
import {existsSync, readFileSync} from "node:fs";

enum VersionExemptPaths {
    OAUTH = "/oauth/"
}

export function IsPathExemptFromVersioning(path: string): boolean {
    for (const exemption in VersionExemptPaths) {
        if (path.includes(exemption)) {
            return true
        }
    }

    return false
}

export function CheckInterfaceForField(objectName: string, objectToValidate: Object, interfaceKeys: string[], errors: {message: string}[]): void{

    for (const field in objectToValidate) {
        if (interfaceKeys.includes(field)) {
            continue;
        }
        errors.push({
            message: `${objectName} has an invalid field: ${field}`
        });
    }
}

interface MasterFileInput {
    "file-glob"?: string
}

interface RouteYamlFile {
    "sp-gateway": { routes: Route[] }
}

let masterRouteIds = new Set<string>();

const getDevMasterInput = (isDev: boolean): MasterFileInput => {
    const localInput = {
        "file-glob": "../packages/test-files/master/sp-gateway-routes.yaml"
    }

    if (process.env.GITHUB_WORKSPACE) {
        Object.fromEntries(
            Object.keys(localInput).map((key) => [
                key,
                core.getInput(key, { required: !isDev }) ||
                (isDev ? localInput[key as keyof MasterFileInput] : undefined),
            ]),
        );
    }

    return localInput
};

function readFilesToAnalyze (githubWorkspace: string, fileGlob: string): { file: string; content: string }[] {
    const files = fileGlob.split(",");
    const fileContents = [];

    for (let i = 0, len = files.length; i < len; i++) {
        const filePath = path.join(githubWorkspace, files[i]);
        console.log(`Checking File in master branch #${i} ${filePath}`);

        if (!filePath.includes("sp-gateway-routes")) {
            console.log("Skipping unrelated files");
            continue;
        }
        try {
            if (existsSync(filePath)) {
                console.log("File exists in master branch, adding it to the list to be compared to changed files");
                fileContents.push({
                    file: files[i],
                    content: readFileSync(filePath, "utf-8"),
                });
            } else {
                core.warning(
                    "File does not exist in master branch, if the file was intentionally deleted during the PR ignore this comment",
                );
            }
        } catch (err) {
            console.error(err);
        }
    }

    return fileContents;
}

export function getMasterRouteIds(): Set<string> {
    if (masterRouteIds.size === 0) {
        const workspace: string = process.env.GITHUB_WORKSPACE ? process.env.GITHUB_WORKSPACE + "/master/" : path.resolve()
        const inputs: MasterFileInput = getDevMasterInput(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test")

        const masterFileContents = readFilesToAnalyze(workspace, inputs["file-glob"]!)

        masterRouteIds = new Set<string>(masterFileContents.map(file => {
            const routeFile = yaml.load(file.content) as RouteYamlFile;
            return routeFile["sp-gateway"].routes
        }).flat().map(route => {
            return route.id
        }));
    }

    return masterRouteIds
}