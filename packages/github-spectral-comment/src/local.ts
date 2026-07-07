/**
 * Local runner for the Spectral comment action.
 *
 * Runs the exact same lint + report pipeline the GitHub Action uses, but
 * against a local checkout of a repo (e.g. cloud-api-client-common) and writes
 * the output to files instead of posting a PR comment. Use it to preview what
 * a branch would produce before deploying the action.
 *
 * Usage (from packages/github-spectral-comment):
 *   pnpm lint:local -- --repo /path/to/cloud-api-client-common
 *   pnpm lint:local -- --repo ../cloud-api-client-common \
 *     --files api-route-specs/sp-gateway-routes.yaml --out /tmp/report.md
 *
 * Check out the branch you want to test in the target repo first
 * (git -C <repo> checkout <branch>); this script reads it as-is.
 */
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { runSpectralAnalysis } from "./action.js";
import {
  createSpectral,
  initProcessedPbs,
  processPbs,
  filterGatewayToChangedLines,
} from "./spectral.js";
import { readFilesToAnalyze } from "./read_files.js";
import {
  GITHUB_COMMENT_MAX_LENGTH,
  toMarkdown,
  truncateForComment,
} from "./to_markdown.js";
import {
  isGatewayRoutesPath,
  parseAddedLines,
  expandChangedLinesToBlocks,
} from "./diff.js";
import { isDev } from "./utils.js";

const parseArgs = (argv: string[]): Record<string, string> => {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--") || token === "--") continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
};

// Best-effort read of the checked-out branch, purely for a confirmation line.
const readBranch = (repo: string): string => {
  try {
    const head = readFileSync(path.join(repo, ".git", "HEAD"), "utf-8").trim();
    const match = head.match(/ref:\s+refs\/heads\/(.+)/);
    return match ? match[1] : head;
  } catch {
    return "unknown";
  }
};

// Added/changed lines (1-indexed, new-file side) for `file` between the merge
// base with `base` and HEAD. Returns null when git can't produce a diff (e.g.
// the base ref is missing) so the caller falls back to the full file.
const getGitChangedLines = (
  repo: string,
  base: string,
  file: string,
): Set<number> | null => {
  try {
    const patch = execFileSync(
      "git",
      ["-C", repo, "diff", `${base}...HEAD`, "--", file],
      { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 },
    );
    return parseAddedLines(patch);
  } catch (error) {
    const first = String((error as Error).message).split("\n")[0];
    console.warn(
      `git diff against '${base}' failed (${first}); showing full file. ` +
        "Pass --base <ref> or --no-diff.",
    );
    return null;
  }
};

const totalFindings = (severitiesCount: Record<number, number>): number =>
  Object.values(severitiesCount).reduce((a, b) => a + b, 0);

// Resolve the base ref to diff against. Honors an explicit --base, otherwise
// picks the first common base branch that exists in the repo. Returns null when
// none can be found, so the caller can fall back to the full file.
const resolveBase = (repo: string, explicit?: string): string | null => {
  const candidates = explicit
    ? [explicit]
    : ["main", "master", "origin/main", "origin/master"];
  for (const candidate of candidates) {
    try {
      execFileSync(
        "git",
        ["-C", repo, "rev-parse", "--verify", "--quiet", candidate],
        { stdio: "ignore" },
      );
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
};

async function main(): Promise<void> {
  if (!isDev) {
    console.error(
      "This runner must be started with NODE_ENV=development (use `pnpm lint:local`).",
    );
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));

  const repoArg = args["repo"];
  if (!repoArg || repoArg === "true") {
    console.error(
      "Missing --repo. Point it at a local checkout of the target repo.\n" +
        "  pnpm lint:local -- --repo /path/to/cloud-api-client-common",
    );
    process.exit(1);
  }
  const repo = path.resolve(repoArg);
  const files = args["files"] || "api-route-specs/sp-gateway-routes.yaml";
  // Diff-scope the gateway routes file (as CI does) unless --no-diff is passed.
  const diffRequested = args["no-diff"] === undefined;
  const base = diffRequested ? resolveBase(repo, args["base"]) : null;
  const diffScoping = diffRequested && base !== null;
  if (diffRequested && base === null) {
    console.warn(
      "Could not find a base branch (main/master). Pass --base <ref> to " +
        "diff-scope the gateway file; showing the full file for now.",
    );
  }
  // Default output lands next to the runner, never inside the target repo, so
  // a preview run can't accidentally be committed into the spec repo.
  const out = path.resolve(
    args["out"] || path.join(process.cwd(), "lint-report.md"),
  );
  const commentOut = out.replace(/\.md$/, "") + ".comment.md";

  // Reading files and building relative links both key off GITHUB_WORKSPACE.
  process.env.GITHUB_WORKSPACE = repo;

  console.log(`Target repo:   ${repo}`);
  console.log(`Branch:        ${readBranch(repo)}`);
  console.log(`Files:         ${files}`);
  console.log(
    `Gateway scope: ${
      diffScoping ? `lines changed vs '${base}'` : "full file"
    }`,
  );
  console.log("");

  const spectralInstances = {
    rootSpectral: await createSpectral(
      args["root-ruleset"] || "../../sailpoint-rulesets/root-ruleset.yaml",
    ),
    pathSpectral: await createSpectral(
      args["path-ruleset"] || "../../sailpoint-rulesets/path-ruleset.yaml",
    ),
    schemaSpectral: await createSpectral(
      args["schema-ruleset"] || "../../sailpoint-rulesets/schema-ruleset.yaml",
    ),
    gatewaySpectral: await createSpectral(
      args["gateway-ruleset"] ||
        "../../gateway-rulesets/gateway-ruleset.yaml",
    ),
  };

  const fileContents = await readFilesToAnalyze(repo, files);
  if (fileContents.length === 0) {
    console.error("No files matched. Check --repo and --files.");
    process.exit(1);
  }

  const results = await runSpectralAnalysis(
    fileContents,
    spectralInstances,
    repo,
  );

  let processedPbs = initProcessedPbs();
  results.forEach(({ file, pbs }) => {
    if (pbs) {
      processedPbs = processPbs(file, processedPbs, pbs);
    }
  });

  // Mirror CI: limit the gateway routes file to lines changed vs the base.
  let scopeSummary = "Gateway scope: full file (all findings reported)";
  if (diffScoping && base) {
    const changedLinesByFile = new Map<string, Set<number> | null>();
    for (const f of files.split(",").map((f) => f.trim())) {
      if (!isGatewayRoutesPath(f)) continue;
      const raw = getGitChangedLines(repo, base, f);
      // Widen to whole route blocks so route-level findings are not missed.
      const content = fileContents.find((fc) => fc.file === f)?.content;
      changedLinesByFile.set(
        f,
        raw && content ? expandChangedLinesToBlocks(content, raw) : raw,
      );
    }
    const before = totalFindings(processedPbs.severitiesCount);
    processedPbs = filterGatewayToChangedLines(processedPbs, changedLinesByFile);
    const after = totalFindings(processedPbs.severitiesCount);
    scopeSummary = `Gateway scope: ${before} -> ${after} findings after limiting to lines changed vs '${base}'`;
  }

  const markdown = await toMarkdown(processedPbs);
  writeFileSync(out, markdown);

  // Reproduce the comment the action would post (footer without a run URL,
  // since there is no workflow run locally).
  const footer =
    `\n\n---\n\n> :warning: This report was truncated because it exceeded ` +
    `GitHub's comment size limit (65,536 characters). ` +
    `See the full report in the workflow run summary.\n`;
  const commentBody = truncateForComment(markdown, footer);
  writeFileSync(commentOut, commentBody);

  const counts = processedPbs.severitiesCount;
  const wasTruncated = markdown.length > GITHUB_COMMENT_MAX_LENGTH;

  console.log(scopeSummary);
  console.log("");
  console.log("Results:");
  console.log(`  Errors:   ${counts[0]}`);
  console.log(`  Warnings: ${counts[1]}`);
  console.log(`  Info:     ${counts[2]}`);
  console.log(`  Hints:    ${counts[3]}`);
  console.log("");
  console.log(
    `Full report:    ${markdown.length.toLocaleString()} chars -> ${out}`,
  );
  console.log(
    `Comment body:   ${commentBody.length.toLocaleString()} chars -> ${commentOut}` +
      (wasTruncated
        ? " (TRUNCATED — full report goes to the job summary in CI)"
        : " (fits, posted as-is)"),
  );
  console.log("");
  console.log(
    wasTruncated
      ? "The report exceeds GitHub's 65,536-char comment limit, so the action " +
          "posts the truncated comment and writes the full report to the job summary."
      : "The report fits within GitHub's comment limit; it would be posted in full.",
  );

  // Mirror the action: a non-zero exit when there are lint errors.
  if (counts[0] > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
