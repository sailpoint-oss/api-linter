import { IFunctionResult } from "@stoplight/spectral-core";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

type Route = {
  path: string;
  apiState?: string;
  versionStart?: number;
};

interface ApiStateData {
  [version: string]: {
    [path: string]: {
      [method: string]: string; // "public" | "public-preview" | etc.
    };
  };
}

function resolveRefSync(refData: any): ApiStateData | null {
  // Check if this is a $ref object
  if (refData && typeof refData === "object" && refData["$ref"]) {
    const refPath = refData["$ref"];

    try {
      // Try to load the referenced file synchronously
      if (typeof require !== "undefined") {
        const fs = require("fs");
        const path = require("path");

        // In ES modules, __dirname is not available, so we'll use different strategies
        let resolvedPath: string | undefined;

        // Try different resolution strategies
        const possiblePaths = [
          // Relative to current working directory
          path.resolve(process.cwd(), refPath),
          // Relative to packages/gateway-rulesets (common structure)
          path.resolve(process.cwd(), "packages", "gateway-rulesets", refPath),
          // Assuming we're running from the gateway-rulesets directory
          path.resolve(refPath),
          // Assuming we're running from the parent directory
          path.resolve("packages", "gateway-rulesets", refPath),
          // Try without leading ./
          path.resolve(process.cwd(), refPath.replace(/^\.\//, "")),
          path.resolve(
            process.cwd(),
            "packages",
            "gateway-rulesets",
            refPath.replace(/^\.\//, "")
          ),
        ];

        for (const tryPath of possiblePaths) {
          if (fs.existsSync(tryPath)) {
            resolvedPath = tryPath;
            break;
          }
        }

        if (!resolvedPath) {
          console.error(`❌ Could not find file for $ref: ${refPath}`);
          return null;
        }

        const fileContent = fs.readFileSync(resolvedPath, "utf-8");
        const data = JSON.parse(fileContent);
        return data;
      }
    } catch (error) {
      console.error(`❌ Failed to resolve $ref:`, error);
    }
  }

  return null;
}

function getApiStateData(contextData?: ApiStateData | any): ApiStateData {
  // First check if data was passed through Spectral functionOptions
  if (contextData && Object.keys(contextData).length > 0) {
    // Check if this is a $ref that needs resolution
    const resolvedData = resolveRefSync(contextData);
    if (resolvedData) {
      return resolvedData;
    }

    // Check if it's already resolved data (has version keys like "2024", "2025", etc.)
    const keys = Object.keys(contextData);
    const hasVersionKeys = keys.some((key) => /^(beta|v3|v?\d{4})$/.test(key));

    if (hasVersionKeys) {
      return contextData as ApiStateData;
    }
  }

  // Fallback: Check for JSON environment variable
  const apiStateMap = process?.env?.API_STATE_MAP;

  if (apiStateMap) {
    try {
      // Parse JSON directly (no base64 decoding)
      const parsedData = JSON.parse(apiStateMap);

      return parsedData as ApiStateData;
    } catch (error) {
      console.error(
        "❌ Failed to parse API state data from environment variable:",
        error
      );
    }
  } else {
    console.warn(
      "⚠️  No API state data found — using empty fallback (all validations will be missing)"
    );
  }

  // Fallback to empty data structure
  return {};
}

// This will be initialized per function call with context data

// Track all routes for summary
const mismatches: Array<{ path: string; issue: string; version: string }> = [];
const limitedPreviewRoutes: Array<{ path: string; version: string }> = [];
let summaryPrinted = false;

/**
 * Normalizes a path by replacing all path parameters with {param}
 */
function normalizePath(path: string): string {
  return path.replace(/\{[^}]+\}/g, "{param}");
}

/**
 * Validates a route against the API state data
 */
function validateRouteWithData(
  route: Route,
  apiStates: ApiStateData
): string | null {
  if (!route.versionStart) {
    return "Missing version information";
  }

  const versionKey = String(route.versionStart);
  const versionData = apiStates[versionKey];

  if (!versionData) {
    return `No API state data for version ${versionKey}`;
  }

  const normalizedRoutePath = normalizePath(route.path);

  // First check exact match
  let pathData = versionData[normalizedRoutePath];
  let isPrefix = false;

  // If no exact match, check for prefix matches
  if (!pathData) {
    // Check if any paths in the data start with our route path (prefix matching)
    for (const [dataPath, methods] of Object.entries(versionData)) {
      const normalizedDataPath = normalizePath(dataPath);
      if (normalizedDataPath.startsWith(normalizedRoutePath + "/")) {
        pathData = methods;
        isPrefix = true;
        break;
      }
    }
  }

  if (!pathData) {
    return `Path not found in ${versionKey} API state data (checked both exact and prefix matches)`;
  }

  // Check if any method has experimental state
  const methodStates = Object.values(pathData);
  const hasPublicPreview = methodStates.includes("public-preview");
  const hasPublic = methodStates.includes("public");
  const allPublic = methodStates.every((state) => state === "public");
  const allPublicPreview = methodStates.every(
    (state) => state === "public-preview"
  );

  // Validate based on route's declared state
  if (route.apiState === "public-preview") {
    if (!hasPublicPreview && hasPublic) {
      return `Path ${route.path} is marked as 'public-preview' in gateway routes but all methods are 'public' in API state data`;
    }
  } else if (route.apiState === "public") {
    if (hasPublicPreview) {
      const previewMethods = Object.entries(pathData)
        .filter(([_, state]) => state === "public-preview")
        .map(([method, _]) => method)
        .join(", ");
      return `Path ${route.path} is marked as 'public' in gateway routes but has 'public-preview' methods (${previewMethods}) in API state data`;
    }
  }

  return null;
}

// Print summary on process exit (only works in Node.js environments)
if (typeof process !== "undefined" && process.on) {
  process.on("beforeExit", () => {
    if (
      !summaryPrinted &&
      (mismatches.length > 0 || limitedPreviewRoutes.length > 0)
    ) {
      summaryPrinted = true;
      console.log("\n\n========================================");
      console.log("API STATE VALIDATION SUMMARY");
      console.log("========================================");
      console.log(`Total mismatches found: ${mismatches.length}`);
      if (limitedPreviewRoutes.length > 0) {
        console.log(
          `Limited-preview routes found: ${limitedPreviewRoutes.length}`
        );
      }

      // Count by version (including limited-preview routes)
      const versionCounts = new Map<string, number>();
      mismatches.forEach(({ version }) => {
        versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
      });
      limitedPreviewRoutes.forEach(({ version }) => {
        versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
      });

      console.log("\nIssues by version:");
      Array.from(versionCounts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([version, count]) => {
          console.log(`  - Version ${version}: ${count} issues`);
        });

      // Group by version and issue type
      const versionGroups = new Map<string, Map<string, string[]>>();

      // Add mismatches to version groups
      mismatches.forEach(({ path, issue, version }) => {
        let issueType = "Other";
        if (issue.includes("not found in")) {
          issueType = "Path not found in API state data";
        } else if (issue.includes("all methods are 'public'")) {
          issueType = "Marked as public-preview but all methods are public";
        } else if (issue.includes("has 'public-preview' methods")) {
          issueType = "Marked as public but has public-preview methods";
        }

        if (!versionGroups.has(version)) {
          versionGroups.set(version, new Map<string, string[]>());
        }

        const versionGroup = versionGroups.get(version)!;
        if (!versionGroup.has(issueType)) {
          versionGroup.set(issueType, []);
        }
        versionGroup.get(issueType)!.push(path);
      });

      // Add limited-preview routes to version groups
      limitedPreviewRoutes.forEach(({ path, version }) => {
        const issueType = "Limited-preview routes (should not be documented)";

        if (!versionGroups.has(version)) {
          versionGroups.set(version, new Map<string, string[]>());
        }

        const versionGroup = versionGroups.get(version)!;
        if (!versionGroup.has(issueType)) {
          versionGroup.set(issueType, []);
        }
        versionGroup.get(issueType)!.push(path);
      });

      // Print grouped issues by version
      const versions = Array.from(versionGroups.keys()).sort();
      versions.forEach((version) => {
        console.log(`\n📌 Version ${version}:`);
        console.log("=".repeat(20));

        const issueGroups = versionGroups.get(version)!;
        issueGroups.forEach((paths, issueType) => {
          console.log(`\n  ${issueType} (${paths.length} issues):`);
          console.log("  " + "-".repeat(issueType.length + 15));

          paths.forEach((path) => {
            console.log(`    - ${path}`);
          });
        });
      });

      console.log("\n========================================\n");
    }
  });
}

export default createOptionalContextRulesetFunction(
  { input: null, options: {} },
  (
    targetVal: Route,
    options?: { specBasePath?: string; apiStateData?: ApiStateData }
  ) => {

    console.log("\nRunning API state validation for:", targetVal.path);

    let results: IFunctionResult[] = [];

    // Priority order: functionOptions > context > environment > empty
    const apiStates = getApiStateData(options?.apiStateData);

    // Handle limited-preview routes separately
    if (
      targetVal.apiState === "limited-preview" &&
      targetVal.versionStart !== 0
    ) {
      // Track limited-preview routes
      limitedPreviewRoutes.push({
        path: targetVal.path,
        version: String(targetVal.versionStart),
      });

      return results;
    }

    if (
      targetVal.apiState !== "private" &&
      targetVal.apiState !== undefined &&
      targetVal.versionStart !== 0
    ) {
      // Validate the route using the loaded API state data
      const validationIssue = validateRouteWithData(targetVal, apiStates);

      if (validationIssue) {
        results.push({
          message: `API state validation failed: ${validationIssue}`,
        });
        // Extract just the key issue from the message
        let shortMessage = validationIssue;
        if (validationIssue.includes("not found in")) {
          shortMessage = `Path not found in ${targetVal.versionStart} API state data`;
        } else if (validationIssue.includes("all methods are 'public'")) {
          shortMessage = `Marked as 'public-preview' but all methods are 'public'`;
        } else if (validationIssue.includes("has 'public-preview' methods")) {
          const match = validationIssue.match(/\(([^)]+)\)/);
          const methods = match ? match[1] : "some methods";
          shortMessage = `Marked as 'public' but ${methods} are 'public-preview'`;
        }

        mismatches.push({
          path: targetVal.path,
          issue: validationIssue,
          version: String(targetVal.versionStart),
        });
      }
    }

    return results;
  }
);
