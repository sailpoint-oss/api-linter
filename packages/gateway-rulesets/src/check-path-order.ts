import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";
import { Route } from "./types.js";


// Create the function using Spectral's helper
export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },
    (routes: Route[], options: {}) => {
        const results = [];
        if (!Array.isArray(routes)) {
            results.push({
                message: `Expected routes to be an array`
            });
        }
        for (const route of routes) {
            if (route.path == null || route.path === "") {
                results.push({
                    message: `Route with id "${route.id}" has a null or empty path.`,
                });
            }
        }
        // return the results since basic validations have failed here for path and routes type.
        if (results.length > 0) {
            return results
        }

        const versionedPaths = routes.filter(
            route => route.versionStart !== 0 && route.versionStart != null
        );
        const nonVersionedPaths = routes.filter(
            route => route.versionStart === 0 || route.versionStart == null
        );

        // Sort paths based on the rules and concat both paths
        versionedPaths.sort(compareRoutes);
        nonVersionedPaths.sort(compareRoutes);

        let combinedPaths = versionedPaths.concat(nonVersionedPaths);
        // Validate the order of paths
        for (let i = 0; i < routes.length; i++) {
            const original = routes[i];
            const sorted = combinedPaths[i];

            if (original.path !== sorted.path) {

                const correctPosition = combinedPaths.findIndex(p => p.path === original.path);
                results.push({
                    message: `Route with path "${original.path}" and id "${original.id}" is at position ${i} but should be at position "${correctPosition}" where route with id "${routes[correctPosition].id}" and path "${routes[correctPosition].path}" is located"`
                });
                return results;
            }
        }
    },
);

function compareRoutes(route1: Route, route2: Route): number {

    // Split paths and filter out empty segments
    const segments1: string[] = route1.path.split('/').filter(s => s.length > 0);
    const segments2: string[] = route2.path.split('/').filter(s => s.length > 0);

    // Compare by path length
    if (segments1.length !== segments2.length) {
        return segments2.length - segments1.length; // Longer paths first
    }

    // Count static segments
    const staticSegments1 = countStaticSegments(segments1);
    const staticSegments2 = countStaticSegments(segments2);

    // Compare by number of static segments
    if (staticSegments1 !== staticSegments2) {
        return staticSegments2 - staticSegments1; // More static segments first
    }

    // Compare segment by segment
    for (let i = 0; i < segments1.length; i++) {
        const seg1 = segments1[i];
        const seg2 = segments2[i];

        const isVar1 = isVariableSegment(seg1);
        const isVar2 = isVariableSegment(seg2);

        // Put static segments before variable segments
        if (isVar1 !== isVar2) {
            return isVar1 ? 1 : -1; // Static segments first
        }

        // If both are static, compare length first then lexicographically
        if (!isVar1 && !isVar2) {
            const lengthComparison = seg2.length - seg1.length;
            if (lengthComparison !== 0) {
                return lengthComparison;
            }

            const strCompare = seg1.localeCompare(seg2);
            if (strCompare !== 0) {
                return strCompare;
            }
        }
    }

    // If everything else is equal, compare lexicographically
    return route1.path.localeCompare(route2.path);
}

function countStaticSegments(segments: string[]): number {
    return segments.filter(segment => !isVariableSegment(segment)).length;
}

function isVariableSegment(segment: string): boolean {
    return segment.startsWith(':') || segment.startsWith('{') && segment.endsWith('}');
}




