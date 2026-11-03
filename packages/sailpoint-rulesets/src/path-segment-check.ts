// Checks the segments of a path key in the root specification.
//
// path-segments-must-be-kebab-case:
//   given: $.paths.*~
//   then:
//     function: path-segment-check
//     functionOptions:
//       check: casing
//       rule: 129
//
// The "check" option selects what to check:
//   casing  - literal segments are kebab-case and parameters are {camelCase} (rule 129)
//   plural  - the segment before a {parameter} is a plural resource name (rule 134)
//   verbs   - segments do not contain verbs (rule 141)
//   depth   - the path has no more than 3 resource levels (rule 147)

import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

// Version segments, for example v1, v2025 and beta, are not resources.
const VERSION_SEGMENT = /^(v\d+|beta)$/;

// Words that are not plural, but name a collection or a singleton resource.
const PLURAL_EXCEPTIONS = new Set([
  "all",
  "children",
  "config",
  "configuration",
  "criteria",
  "data",
  "history",
  "info",
  "me",
  "metadata",
  "people",
  "search",
  "self",
  "status",
  "summary",
]);

// Verbs that reviewers asked to remove from paths. A segment that contains
// one of these words, for example run-report, describes an action and not
// a resource.
const VERBS = new Set([
  "activate",
  "add",
  "aggregate",
  "approve",
  "assign",
  "cancel",
  "classify",
  "complete",
  "create",
  "deactivate",
  "decide",
  "delete",
  "disable",
  "download",
  "enable",
  "evaluate",
  "execute",
  "fetch",
  "forward",
  "generate",
  "get",
  "launch",
  "load",
  "process",
  "provision",
  "publish",
  "reassign",
  "reject",
  "reload",
  "remove",
  "rerun",
  "reset",
  "run",
  "send",
  "set",
  "submit",
  "synchronize",
  "terminate",
  "test",
  "trigger",
  "unlock",
  "update",
  "upload",
  "validate",
  "verify",
]);

function isParameter(segment: string) {
  return segment.startsWith("{") && segment.endsWith("}");
}

function isPlural(segment: string) {
  const lastWord = segment.split("-").pop() ?? segment;
  return lastWord.endsWith("s") || PLURAL_EXCEPTIONS.has(lastWord);
}

function checkCasing(segments: string[]) {
  const problems: string[] = [];
  for (const segment of segments) {
    if (isParameter(segment)) {
      if (!/^\{[a-z][a-zA-Z0-9]*\}$/.test(segment)) {
        problems.push(`path parameter "${segment}" must use {camelCase}`);
      }
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(segment)) {
      problems.push(`path segment "${segment}" must use lowercase words separated by hyphens (kebab-case)`);
    }
  }
  return problems;
}

function checkPlural(segments: string[]) {
  const problems: string[] = [];
  segments.forEach((segment, index) => {
    if (!isParameter(segment) || index === 0) return;
    // The resource name is the literal segment before the parameter. Skip a
    // version segment, as in /access-profiles/v1/{id}.
    let resourceIndex = index - 1;
    while (resourceIndex >= 0 && VERSION_SEGMENT.test(segments[resourceIndex])) resourceIndex--;
    const resource = segments[resourceIndex];
    if (resource === undefined || isParameter(resource)) return;
    if (!isPlural(resource)) {
      problems.push(`the resource name "${resource}" before "${segment}" must be plural`);
    }
  });
  return [...new Set(problems)];
}

function checkVerbs(segments: string[]) {
  const problems: string[] = [];
  for (const segment of segments) {
    // Bulk operations, for example bulk-delete, follow rule 152.
    if (isParameter(segment) || segment.startsWith("bulk-")) continue;
    const verbs = segment
      .split(/-|(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .filter((word) => VERBS.has(word));
    if (verbs.length > 0) {
      problems.push(`path segment "${segment}" contains the verb "${verbs[0]}". Model the action as a resource or use the HTTP method instead`);
    }
  }
  return problems;
}

function checkDepth(segments: string[]) {
  const resources = segments.filter((segment) => !isParameter(segment) && !VERSION_SEGMENT.test(segment));
  if (resources.length > 3) {
    return [`the path has ${resources.length} resource levels and must not have more than 3 sub-resources`];
  }
  return [];
}

const CHECKS: Record<string, (segments: string[]) => string[]> = {
  casing: checkCasing,
  plural: checkPlural,
  verbs: checkVerbs,
  depth: checkDepth,
};

export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        check: { enum: Object.keys(CHECKS) },
        rule: true,
      },
      required: ["check", "rule"],
    },
  },
  (targetVal: string, options: { check: string; rule: string }) => {
    const { check, rule } = options;
    if (typeof targetVal !== "string") return;

    const segments = targetVal.split("/").filter((segment) => segment !== "");
    return CHECKS[check](segments).map((problem) => ({
      message: `Rule ${rule}: In ${targetVal}, ${problem}`,
    }));
  },
);
