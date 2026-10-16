import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import {Route} from "./types.js";
import {IsPathExemptFromVersioning} from "./utils.js";

const versionPattern = /-v\d$/
const internalPattern = /-internal$/

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
        },
    },
    (route: Route, options: {}) => {
        let results = [];
        if (!IsPathExemptFromVersioning(route.path)
            && (!route.versionStart || route.versionStart == 0)
            && !versionPattern.test(route.id)
            && !internalPattern.test(route.id)) {
            results.push({
                message: `route id must end with a version (eg. example-route-id-v1, example-route-id-internal)`
            });
        }
        return results;
    },
);

