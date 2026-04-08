// Copyright (c) 2026. SailPoint Technologies, Inc. All rights reserved.
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import { Route } from "./types.js";

const V_YEAR_KEY = /^v(\d{4})$/;

/**
 * Returns the numeric year for keys like v2026, or null for beta, v3, etc.
 */
function yearFromVersionDetailsKey(key: string): number | null {
  const m = V_YEAR_KEY.exec(key);
  return m ? parseInt(m[1], 10) : null;
}

export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {},
  },
  (targetVal: Route) => {
    const results: { message: string }[] = [];

    if (targetVal.versionEnd === undefined || targetVal.versionDetailsMap === undefined) {
      return results;
    }

    const endVersion = targetVal.versionEnd;
    if (endVersion === 0) {
      return results;
    }

    const map = targetVal.versionDetailsMap as unknown as Record<string, unknown>;
    for (const key of Object.keys(map)) {
      const year = yearFromVersionDetailsKey(key);
      if (year !== null && year > endVersion) {
        results.push({
          message: `versionDetailsMap key "${key}" (API version ${year}) cannot be greater than versionEnd (${endVersion}); that entry is ignored by sp-gateway.`,
        });
      }
    }

    return results;
  },
);
