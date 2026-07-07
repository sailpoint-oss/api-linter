import core from "@actions/core";
import github from "@actions/github";

// Path fragment identifying the gateway routes file. Only this file is scoped
// to a PR's changed lines; every other linted file is reported in full.
export const isGatewayRoutesPath = (p: string): boolean =>
  p.includes("sp-gateway-routes");

/**
 * Parse a unified-diff patch into the set of 1-indexed line numbers that were
 * added or changed on the new-file side. Deleted lines are ignored (they no
 * longer exist to lint), and the file headers (+++/---) are skipped.
 */
export const parseAddedLines = (patch: string): Set<number> => {
  const added = new Set<number>();
  let newLine = 0;

  for (const line of patch.split("\n")) {
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = parseInt(hunk[1], 10);
      continue;
    }
    if (line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }

    if (line.startsWith("+")) {
      added.add(newLine);
      newLine++;
    } else if (line.startsWith("-")) {
      // Deletion: the new-file line counter does not advance.
    } else {
      // Context line (leading space, or a blank trailing line): advances.
      newLine++;
    }
  }

  return added;
};

/**
 * Expand a set of changed line numbers to cover the entire enclosing route
 * block. A finding on a route (e.g. "invalid field") anchors to the route's
 * `- id:` line, not the specific field line that was edited, so scoping by the
 * raw changed lines alone would miss route-level findings on a route you
 * touched. This widens each changed line to its whole `  - …` list item.
 */
export const expandChangedLinesToBlocks = (
  content: string,
  changed: Set<number>,
): Set<number> => {
  if (changed.size === 0) return changed;

  const lines = content.split("\n");
  // 1-indexed line numbers where a route list item begins (2-space indent).
  const starts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^ {2}- /.test(lines[i])) {
      starts.push(i + 1);
    }
  }

  const expanded = new Set<number>(changed);
  for (const line of changed) {
    let blockStart = -1;
    let blockEnd = lines.length;
    for (let s = 0; s < starts.length; s++) {
      if (starts[s] <= line) {
        blockStart = starts[s];
        blockEnd = s + 1 < starts.length ? starts[s + 1] - 1 : lines.length;
      } else {
        break;
      }
    }
    if (blockStart !== -1) {
      for (let l = blockStart; l <= blockEnd; l++) expanded.add(l);
    }
  }

  return expanded;
};

/**
 * Fetch the added/changed line numbers for PR files matching `matches`.
 *
 * Returns a map keyed by PR file path. A value of `null` means the file
 * changed but GitHub returned no patch (e.g. it was too large), so specific
 * lines are unknown. Files absent from the map were not changed in the PR.
 */
export const getChangedLinesForPr = async (
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context,
  matches: (filename: string) => boolean,
): Promise<Map<string, Set<number> | null>> => {
  const result = new Map<string, Set<number> | null>();

  if (!context.payload.pull_request) {
    core.debug("No pull request in context; skipping changed-line lookup");
    return result;
  }

  const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request.number,
    per_page: 100,
  });

  for (const file of files) {
    if (!matches(file.filename)) continue;
    result.set(file.filename, file.patch ? parseAddedLines(file.patch) : null);
  }

  core.debug(`Collected changed-line data for ${result.size} matched file(s)`);
  return result;
};
