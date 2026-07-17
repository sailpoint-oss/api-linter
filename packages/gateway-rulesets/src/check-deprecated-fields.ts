// check against master branch, if route does not exist, return error

import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";
import {Route} from "./types.js";
import path from "path";
import core from "@actions/core";
import {existsSync, readFileSync} from "node:fs";

const versionPattern = /-v\d$/
const internalPattern = /-internal$/
const validAdditionalVersions: string[] = ["v3", "beta"]
const versionYearPattern = /^v(\d{4})$/;
const validVersionMapKeyPattern = /^beta$|^v3$|^v(202[4-9]|20[3-9][0-9]|2[1-9][0-9]{2})$/
const deprecationYearPattern = /^\d{4}-\d{2}-\d{2}$/;
const validApiStates = ["private", "limited-preview", "public-preview", "public"]

interface MasterFileInput {
    "file-glob"?: string
}

const getDevMasterInput = (): MasterFileInput => {
    return {
        "file-glob": "../../packages/test-files/master/sp-gateway-routes.yaml"
    }
};

function readFilesToAnalyze (githubWorkspace: string, fileGlob: string): { file: string; content: string }[] {
    const files = fileGlob.split(",");
    const fileContents = [];

    for (let i = 0, len = files.length; i < len; i++) {
        const filePath = path.join(githubWorkspace, files[i]);
        console.log(`Checking File in master branch #${i} ${filePath}`);

        if (!filePath.includes("api-route-specs")) {
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

function getMasterRouteIds(): Set<string> {
    const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    const workspace: string = process.env.GITHUB_WORKSPACE || path.resolve()
    const inputs: MasterFileInput = Object.fromEntries(
        Object.keys(getDevMasterInput()).map((key) => [
            key,
            core.getInput(key, { required: !isDev }) ||
            (isDev ? getDevMasterInput()[key as keyof MasterFileInput] : undefined),
        ]),
    );

    const masterFileContents = readFilesToAnalyze(workspace, inputs['file-glob']!)

    return new Set<string>(masterFileContents.map(file => {
        const route = JSON.parse(file.content) as Route;
        return route.id;
    }))
}

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },(routes: Route[], options: {}) => {
        let results: {message: string}[] = [];

        const masterRouteIds = getMasterRouteIds();
        routes.forEach(route => {
            if (!masterRouteIds.has(route.id) || versionPattern.test(route.id) || internalPattern.test(route.id)) {
                if (route.versionStart && route.versionStart > 0) {
                    results.push({
                        message: `route ${route.id} uses a deprecated field: 'versionStart', and cannot be added to the route spec. Refer to **** for the new API versioning strategy.`
                    });
                }

                if (route.additionalVersions) {
                    results.push({
                        message: `route ${route.id} uses a deprecated field: 'additionalVersions', and cannot be added to the route spec. Refer to **** for the new API versioning strategy.`
                    });
                }

                if (route.versionEnd && route.versionEnd > 0) {
                    results.push({
                        message: `route ${route.id} uses a deprecated field: 'versionEnd', and cannot be added to the route spec. Refer to **** for the new API versioning strategy.`
                    });
                }

                if (route.versionDetailsMap) {
                    results.push({
                        message: `route ${route.id} has a deprecated field: 'versionDetailsMap', and cannot be added to the route spec. Refer to **** for the new API versioning strategy.`
                    });
                }
            } else {
                if (!route.versionStart) {
                    results.push({
                        message: `route ${route.id} is missing a required field: 'versionStart'.`
                    });
                } else {
                    results.push(...checkVersionStart(route.versionStart));
                }

                if (route.additionalVersions) {
                    results.push(...checkAdditionalVersions(route.additionalVersions));
                }

                if (route.versionDetailsMap) {

                    for (const [k, v] of route.versionDetailsMap) {
                        if (!validVersionMapKeyPattern.test(k)) {
                            results.push({
                                message: `route ${route.id} has a versionDetailsMap entry with an invalid key: ${k}. Must be a valid api version e.g. beta, v3 or v20XX.`
                            })
                        }

                        if (v.apiState && !validApiStates.includes(v.apiState)) {
                            results.push({
                                message: `route ${route.id} has a versionDetailsMap entry ${k} with an invalid API state: ${v.apiState}. Must be private, limited-preview, public-preview, or public.`
                            })
                        }

                        if (v.deprecation && !deprecationYearPattern.test(v.deprecation)) {
                            results.push({
                                message: `route ${route.id} has a versionDetailsMap entry ${k} with an improperly formatted deprecation date: ${v.deprecation}. Must be a valid date in yyyy-mm-dd format.`
                            })
                        }
                    }

                    results.push(...checkVersionDetailsVsVersionEnd(route))
                }

                results.push(...checkLatestVersionOverride(route))
            }
        })

        return results;
    });

function checkVersionStart(versionStart: number): {message: string}[] {
    let results: {message: string}[] = [];
    if (!Number.isInteger(versionStart)) {
        results.push({
            message: `versionStart must be a number`
        });
    }
    if (!(versionStart === 0 || 2024 <= versionStart)) {
        results.push({
            message: `versionStart must be 0 or higher than 2024`
        });
    }
    return results;
}

function checkAdditionalVersions(additionalVersions: string[]): {message: string}[] {
    let results: {message: string}[] = [];

    for (const version in additionalVersions) {
        if (!validAdditionalVersions.includes(version)) {
            results.push({
                message: `${version} is not a valid entry in additionalVersions. Valid entries are ${validAdditionalVersions}.`
            });
        }
    }

    return results;
}

function checkLatestVersionOverride(route: Route): {message: string}[] {
    let results = [];

    if (route.latestVersionOverride !== undefined) {
        const latestVersion = route.latestVersionOverride;

        if (!isValidVersion(latestVersion)) {
            results.push({
                message: `latestVersionOverride "${latestVersion}" is not a valid version. Must be 0 for non-versioned APIs or a year >= 2024.`
            });
        }

        if (route.versionEnd !== undefined) {
            const endVersion = route.versionEnd;

            if (!isValidVersion(endVersion)) {
                results.push({
                    message: `versionEnd "${endVersion}" is not a valid version. Must be 0 for non-versioned APIs or a year >= 2024.`
                });
            } else {
                if (isValidVersion(latestVersion) && compareVersions(latestVersion, endVersion) > 0) {
                    results.push({
                        message: `latestVersionOverride "${latestVersion}" cannot be greater than versionEnd "${endVersion}"`
                    });
                }
            }
        }
    }

    return results;
}

function checkVersionDetailsVsVersionEnd(route: Route): {message: string}[] {
    const results: { message: string }[] = [];

    if (route.versionEnd === undefined || route.versionDetailsMap === undefined) {
        return results;
    }

    const endVersion = route.versionEnd;
    if (endVersion === 0) {
        return results;
    }

    const map = route.versionDetailsMap as unknown as Record<string, unknown>;
    for (const key of Object.keys(map)) {
        const year = yearFromVersionDetailsKey(key);
        if (year !== null && year > endVersion) {
            results.push({
                message: `versionDetailsMap key "${key}" (API version ${year}) cannot be greater than versionEnd (${endVersion}); that entry is ignored by sp-gateway.`,
            });
        }
    }

    return results;
}

function isValidVersion(version: number): boolean {
    return version === 0 || (Number.isInteger(version) && version >= 2024);
}

function compareVersions(version1: number, version2: number): number {
    return version1 - version2;
}

function yearFromVersionDetailsKey(key: string): number | null {
    const m = versionYearPattern.exec(key);
    return m ? parseInt(m[1], 10) : null;
}