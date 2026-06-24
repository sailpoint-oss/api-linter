import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";
import {Route} from "./types.js";

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
        },
    },
    (route: Route, options: {}) => {
        const versionPattern = /v\d$/
        const internalPattern = /internal$/

        let internalResults = checkVersionPattern(route.id, route.path, internalPattern);
        if (internalResults.length > 0) {
            return internalResults;
        }

        return checkVersionPattern(route.id, route.path, versionPattern);
    },
);

function checkVersionPattern(id: string, path: string, versionPattern: RegExp) : {message: string}[] {
    let results: {message: string}[] = [];

    if (!versionPattern.test(id) && !versionPattern.test(path)) {
        return results;
    } else if ((!versionPattern.test(id) && versionPattern.test(path)) || (versionPattern.test(id) && !versionPattern.test(path))) {
        results.push({
            message: `route id and path must contain the same API version (eg. example-route-id-v1, example/path/v1)`
        });
        return results;
    }

    const pathVersionMatches = path.match(versionPattern);
    if (!pathVersionMatches) {
        results.push({
            message: `path '${path}' must contain the API version of the route (eg. v1, v2, internal, etc.)`
        });
    } else {
        if (pathVersionMatches?.length > 1) {
            results.push({
                message: `path '${path}' must contain only one API version (eg. v1, v2, internal, etc.)`
            });
        } else if (pathVersionMatches[0] !== id.split('-').at(-1)) {
            results.push({
                message: `the API version in '${path}' must match the API version of the route id: ${id.split('-').at(-1)}`
            });
        }
    }

    return results;
}

