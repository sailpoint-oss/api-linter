import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";
import {Route} from "./types.js";
import {IsPathExemptFromVersioning} from "./utils.js";

const versionPattern = /(\/v\d\/|\/v\d$)/
const internalPattern = /-internal$/

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
        },
    },
    (route: Route, options: {}) => {
        let results: {message: string}[] = [];

        if (IsPathExemptFromVersioning(route.path) || (route.versionStart && route.versionStart > 0) || internalPattern.test(route.id)) {
            return results;
        }

        if (!versionPattern.test(route.id) && !versionPattern.test(route.path)) {
            return results;
        } else if ((!versionPattern.test(route.id) && versionPattern.test(route.path)) || (versionPattern.test(route.id) && !versionPattern.test(route.path))) {
            results.push({
                message: `route id and path must contain the same API version (eg. example-route-id-v1, example/path/v1)`
            });
            return results;
        }

        const pathVersionMatches = route.path.match(versionPattern);
        if (!pathVersionMatches) {
            results.push({
                message: `path '${route.path}' must contain the API version of the route (eg. v1, v2, etc.)`
            });
        } else {
            if (pathVersionMatches?.length > 1) {
                results.push({
                    message: `path '${route.path}' must contain only one API version (eg. v1, v2, etc.)`
                });
            } else if (pathVersionMatches[0] !== route.id.split('-').at(-1)) {
                results.push({
                    message: `the API version in '${route.path}' must match the API version of the route id: ${route.id.split('-').at(-1)}`
                });
            }
        }

        return results;
    },
);

