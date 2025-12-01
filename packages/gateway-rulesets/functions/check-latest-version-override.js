import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
function isValidVersion(version) {
    return version === 0 || (Number.isInteger(version) && version >= 2024);
}
function compareVersions(version1, version2) {
    return version1 - version2;
}
export default createOptionalContextRulesetFunction({
    input: null,
    options: {},
}, (targetVal, options) => {
    let results = [];
    if (targetVal.latestVersionOverride !== undefined) {
        const latestVersion = targetVal.latestVersionOverride;
        if (!isValidVersion(latestVersion)) {
            results.push({
                message: `latestVersionOverride "${latestVersion}" is not a valid version. Must be 0 for non-versioned APIs or a year >= 2024.`
            });
        }
        if (targetVal.versionEnd !== undefined) {
            const endVersion = targetVal.versionEnd;
            if (!isValidVersion(endVersion)) {
                results.push({
                    message: `versionEnd "${endVersion}" is not a valid version. Must be 0 for non-versioned APIs or a year >= 2024.`
                });
            }
            else {
                if (isValidVersion(latestVersion) && compareVersions(latestVersion, endVersion) > 0) {
                    results.push({
                        message: `latestVersionOverride "${latestVersion}" cannot be greater than versionEnd "${endVersion}"`
                    });
                }
            }
        }
    }
    return results;
});
//# sourceMappingURL=check-latest-version-override.js.map