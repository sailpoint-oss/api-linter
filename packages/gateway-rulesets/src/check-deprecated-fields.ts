// check against master branch, if route does not exist, return error

import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";
import {Route, VersionDetails} from "./types.js";
import {getMasterRouteIds} from "./utils.js";

const newVersionIdPattern = /-v\d$|-internal$/
const validAdditionalVersions: string[] = ["v3", "beta"]
const versionYearPattern = /^v(\d{4})$/;
const validVersionMapKeyPattern = /^beta$|^v3$|^v(202[4-9]|20[3-9][0-9]|2[1-9][0-9]{2})$/
const deprecationYearPattern = /^\d{4}-\d{2}-\d{2}$/;
const validApiStates = ["private", "limited-preview", "public-preview", "public"]

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },(route: Route, options: {}) => {
        let results: {message: string}[] = [];

        const masterRouteIds = getMasterRouteIds();

        if (!masterRouteIds.has(route.id) || newVersionIdPattern.test(route.id)) {
            if (route.versionStart && route.versionStart > 0) {
                results.push({
                    message: `route ${route.id} uses a deprecated field: 'versionStart', and cannot be added to the route spec. Refer to https://sailpoint.atlassian.net/wiki/x/ZwHcNQE for the new API versioning strategy.`
                });
            }

            if (route.additionalVersions) {
                results.push({
                    message: `route ${route.id} uses a deprecated field: 'additionalVersions', and cannot be added to the route spec. Refer to https://sailpoint.atlassian.net/wiki/x/ZwHcNQE for the new API versioning strategy.`
                });
            }

            if (route.versionEnd && route.versionEnd > 0) {
                results.push({
                    message: `route ${route.id} uses a deprecated field: 'versionEnd', and cannot be added to the route spec. Refer to https://sailpoint.atlassian.net/wiki/x/ZwHcNQE for the new API versioning strategy.`
                });
            }

            if (route.versionDetailsMap) {
                results.push({
                    message: `route ${route.id} has a deprecated field: 'versionDetailsMap', and cannot be added to the route spec. Refer to https://sailpoint.atlassian.net/wiki/x/ZwHcNQE for the new API versioning strategy.`
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
                // javascript doesn't like maps, so we have to manually convert this to a Record
                const versionMap = route.versionDetailsMap as unknown as Record<string, VersionDetails>;
                Object.keys(versionMap).forEach((key) => {
                    const details = versionMap[key]
                    if (!validVersionMapKeyPattern.test(key)) {
                        results.push({
                            message: `route ${route.id} has a versionDetailsMap entry with an invalid key: ${key}. Must be a valid api version e.g. beta, v3 or v20XX.`
                        })
                    }

                    if (details.apiState && !validApiStates.includes(details.apiState)) {
                        results.push({
                            message: `route ${route.id} has a versionDetailsMap entry ${key} with an invalid API state: ${details.apiState}. Must be private, limited-preview, public-preview, or public.`
                        })
                    }

                    if (details.deprecation && !deprecationYearPattern.test(details.deprecation)) {
                        results.push({
                            message: `route ${route.id} has a versionDetailsMap entry ${key} with an improperly formatted deprecation date: ${details.deprecation}. Must be a valid date in yyyy-mm-dd format.`
                        })
                    }
                })

                results.push(...checkVersionDetailsVsVersionEnd(route))
            }

            results.push(...checkLatestVersionOverride(route))
        }

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

    for (const version of additionalVersions) {
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