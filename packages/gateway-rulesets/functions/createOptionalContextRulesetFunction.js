import { createRulesetFunction as createSpectralFn, } from "@stoplight/spectral-core";
/**
 * Creates a Spectral ruleset function whose context parameter is optional.
 * If no context is provided, it defaults to an empty object.
 *
 * @param input - The input value (usually null).
 * @param options - Schema options for the function.
 * @param fn - The actual ruleset function.
 * @returns A wrapper function for the ruleset function.
 */
export function createOptionalContextRulesetFunction(params, fn) {
    // Create the original spectral function.
    const originalFn = createSpectralFn(params, fn);
    // Return a wrapper that makes the third parameter (context) optional.
    return ((targetVal, opts, context) => {
        return originalFn(targetVal, opts, context || {}); // default to an empty object if context is not provided.
    });
}
//# sourceMappingURL=createOptionalContextRulesetFunction.js.map