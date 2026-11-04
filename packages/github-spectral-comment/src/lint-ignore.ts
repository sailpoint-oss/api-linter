// Lets a spec author turn off a rule for one part of a spec. Add the
// x-sailpoint-lint-ignore extension to the node that the rule reports, or to
// one of its parents. Each key is a rule name, and each value is the reason:
//
// get:
//   x-sailpoint-lint-ignore:
//     path-list-endpoints-must-support-pagination: The list has at most 5 entries.
//
// Spectral has no inline way to turn off a rule, so this filter runs on the
// results after Spectral. A key without a reason does not turn off the rule.

import fs from "node:fs";
import Parsers from "@stoplight/spectral-parsers";
import type { ISpectralDiagnostic } from "@stoplight/spectral-core";

export const LINT_IGNORE_KEY = "x-sailpoint-lint-ignore";

function ignoredRules(node: unknown): string[] {
  if (!node || typeof node !== "object" || Array.isArray(node)) return [];
  const ignore = (node as Record<string, unknown>)[LINT_IGNORE_KEY];
  if (!ignore || typeof ignore !== "object" || Array.isArray(ignore)) return [];
  return Object.entries(ignore)
    .filter(([, reason]) => typeof reason === "string" && reason.trim() !== "")
    .map(([rule]) => rule);
}

// True if the node at the path, or one of its parents, ignores the rule.
export function isIgnored(document: unknown, path: ReadonlyArray<string | number>, rule: string): boolean {
  let node: unknown = document;
  if (ignoredRules(node).includes(rule)) return true;
  for (const segment of path) {
    if (!node || typeof node !== "object") return false;
    node = (node as Record<string, unknown>)[segment];
    if (ignoredRules(node).includes(rule)) return true;
  }
  return false;
}

// Removes the results that an x-sailpoint-lint-ignore extension turns off.
// A result can point to a referenced file, so each source file is parsed.
export function filterIgnoredResults<T extends ISpectralDiagnostic>(
  results: T[],
  documentPath: string,
  documentContent: string,
): T[] {
  const documents = new Map<string, unknown>();
  const load = (source: string): unknown => {
    if (!documents.has(source)) {
      let data: unknown;
      try {
        const content = source === documentPath ? documentContent : fs.readFileSync(source, "utf8");
        data = Parsers.Yaml.parse(content).data;
      } catch {
        data = undefined;
      }
      documents.set(source, data);
    }
    return documents.get(source);
  };

  return results.filter((result) => !isIgnored(load(result.source ?? documentPath), result.path, String(result.code)));
}
