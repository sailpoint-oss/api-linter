import {createOptionalContextRulesetFunction} from "./createOptionalContextRulesetFunction.js";

type Route = {
    path: string;
    versionStart: number;
};


// Create the function using Spectral's helper
export default createOptionalContextRulesetFunction(
    {
        input: null,
        options: {},
    },
    (routes: Route[], options: {}) => {
        const results = [];
        const versionedPaths = routes.filter(route => route.versionStart!=0).map(route => route.path);
        const nonVersionedPaths = routes.filter(route => route.versionStart==0).map(route => route.path);


        // Sort paths based on the rules and concat both paths
        versionedPaths.sort(compareRoutes);
        nonVersionedPaths.sort(compareRoutes);

        let combinedPaths = versionedPaths.concat(nonVersionedPaths);

        // Validate the order of paths
        for (let i = 0; i < routes.length; i++) {
            const original = routes[i];
            const sorted = combinedPaths[i];

            if (original.path !== sorted) {
                results.push({
                    message: `Route with path "${original.path}" is at position ${i} but should be at position ${combinedPaths.findIndex(p => p === original.path)}`
                });
            }
        }

        return results;
    },
);

function compareRoutes(path1: string, path2: string): number {
    // Split paths and filter out empty segments
    const segments1: string[] = path1.split('/').filter(s => s.length > 0);
    const segments2: string[] = path2.split('/').filter(s => s.length > 0);

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
    return path1.localeCompare(path2);
}

function countStaticSegments(segments: string[]): number {
    return segments.filter(segment => !isVariableSegment(segment)).length;
}

function isVariableSegment(segment: string): boolean {
    return segment.startsWith(':') || segment.startsWith('{') && segment.endsWith('}');
}




