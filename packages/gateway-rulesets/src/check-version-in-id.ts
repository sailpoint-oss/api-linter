import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

const versionPattern = /-v\d$/
const internalPattern = /-internal$/

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
        },
    },
    (routeId: string, options: {}) => {
        let results = [];
        if (!versionPattern.test(routeId) && !internalPattern.test(routeId)) {
            results.push({
                message: `route id must end with a version (eg. example-route-id-v1, example-route-id-internal)`
            });
        }
        return results;
    },
);

