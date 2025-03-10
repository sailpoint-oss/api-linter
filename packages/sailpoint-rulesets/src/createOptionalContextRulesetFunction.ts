import {
  createRulesetFunction as createSpectralFn,
  RulesetFunction,
  RulesetFunctionContext,
} from "@stoplight/spectral-core";

/**
 * Creates a Spectral ruleset function whose context parameter is optional.
 * If no context is provided, it defaults to an empty object.
 *
 * @param input - The input value (usually null).
 * @param options - Schema options for the function.
 * @param fn - The actual ruleset function.
 * @returns A wrapper function for the ruleset function.
 */
export function createOptionalContextRulesetFunction<I, O>(
  params: {
    input: any;
    options: any;
  },
  fn: RulesetFunction<I, O>,
) {
  // Create the original spectral function.
  const originalFn = createSpectralFn(params, fn);

  // Return a wrapper that makes the third parameter (context) optional.
  return ((
    targetVal: I,
    opts: O,
    context?: Parameters<typeof originalFn>[2],
  ) => {
    return originalFn(
      targetVal,
      opts,
      context || ({} as RulesetFunctionContext),
    ); // default to an empty object if context is not provided.
  }) as (
    targetVal: I,
    opts: O,
    context?: Parameters<typeof originalFn>[2],
  ) => ReturnType<typeof originalFn>;
}
