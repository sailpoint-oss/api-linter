import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { Route } from "./types.js";

function isValidVersion(version: number): boolean {
    // Check for valid version numbers (0 for non-versioned, or year >= 2024)
    return version === 0 || (Number.isInteger(version) && version >= 2024);
}

function compareVersions(version1: number, version2: number): number {
    // Simple numeric comparison
    return version1 - version2;
}

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
        },
    },
    (targetVal: Route, options: { }) => {
        let results = [];
        
        // Check if latestVersionOverride exists
        if (targetVal.latestVersionOverride !== undefined) {
            const latestVersion = targetVal.latestVersionOverride;
            
            // Validate latestVersionOverride format
            if (!isValidVersion(latestVersion)) {
                results.push({
                    message: `latestVersionOverride "${latestVersion}" is not a valid version. Must be 0 for non-versioned APIs or a year >= 2024.`
                });
            }
            
            // Check if versionEnd exists and compare
            if (targetVal.versionEnd !== undefined) {
                const endVersion = targetVal.versionEnd;
                
                // Validate versionEnd format
                if (!isValidVersion(endVersion)) {
                    results.push({
                        message: `versionEnd "${endVersion}" is not a valid version. Must be 0 for non-versioned APIs or a year >= 2024.`
                    });
                } else {
                    // Compare versions if both are valid
                    if (isValidVersion(latestVersion) && compareVersions(latestVersion, endVersion) > 0) {
                        results.push({
                            message: `latestVersionOverride "${latestVersion}" cannot be greater than versionEnd "${endVersion}"`
                        });
                    }
                }
            }
        }
        
        return results;
    },
);
