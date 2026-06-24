import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import {Route} from "./types.js";

export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {
        },
    },
    (route: Route, options: {}) => {
        let results = [];
        if (route.stripPrefix && route.stripPrefixPath && !route.path.startsWith(route.stripPrefixPath)) {
            results.push({
                message: `stripPrefixPath must match path when stripPrefix is true`
            });
        }
        return results;
    },
);

