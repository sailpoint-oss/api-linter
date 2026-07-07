import core from "@actions/core";
import github from "@actions/github";
import { writeFileSync } from "fs";
import {
  validateInputs,
  getProjectConfig,
  runSpectralAnalysis,
  createGithubComment,
  getGithubComment,
  updateGithubComment,
} from "./action.js";
import { ActionInputs } from "./types.js";
import {
  createSpectral,
  initProcessedPbs,
  processPbs,
  filterGatewayToChangedLines,
} from "./spectral.js";
import { readFilesToAnalyze } from "./read_files.js";
import { toMarkdown, truncateForComment } from "./to_markdown.js";
import {
  getChangedLinesForPr,
  isGatewayRoutesPath,
  expandChangedLinesToBlocks,
} from "./diff.js";
import { getDevInputs } from "./config.js";
import { isDev } from "./utils.js";

async function run(): Promise<void> {
  try {
    // Get and validate inputs
    const inputs: ActionInputs = Object.fromEntries(
      Object.keys(getDevInputs()).map((key) => [
        key,
        core.getInput(key, { required: !isDev }) ||
          (isDev ? getDevInputs()[key as keyof ActionInputs] : undefined),
      ]),
    );

    await validateInputs(inputs);

    core.debug("Loading project config");

    // Setup project configuration
    const project = getProjectConfig();

    // Read files and create Spectral instances
    const fileContents = await readFilesToAnalyze(
      project.workspace,
      inputs["file-glob"]!,
    );

    core.debug("Creating spectral instances");

    const spectralInstances = {
      rootSpectral: await createSpectral(inputs["spectral-root-ruleset"]!),
      pathSpectral: await createSpectral(inputs["spectral-path-ruleset"]!),
      schemaSpectral: await createSpectral(inputs["spectral-schema-ruleset"]!),
      gatewaySpectral: await createSpectral(inputs["spectral-gateway-ruleset"]!),
    };

    core.debug("Running spectral analysis");

    // Run analysis
    const results = await runSpectralAnalysis(
      fileContents,
      spectralInstances,
      project.workspace,
    );

    core.debug("Processing results");

    core.startGroup("Results");
    results.forEach(({ file, pbs }) => {
      if (pbs) {
        core.debug(`${file}`);
        pbs.results.forEach((result) => {
          core.debug(`  ${result.code}`);
          core.debug(`    ${result.message}`);
          core.debug(`    ${result.severity}`);
          core.debug(`    ${result.path}`);
        });
      }
    });
    core.endGroup();

    // Process results
    let processedPbs = initProcessedPbs();
    results.forEach(({ file, pbs }) => {
      if (pbs) {
        processedPbs = processPbs(file, processedPbs, pbs);
      }
    });

    core.startGroup("Processed PBs");
    Object.entries(processedPbs.severitiesCount).forEach(
      ([severity, count]) => {
        core.debug(`${severity}: ${count}`);
      },
    );
    Object.entries(processedPbs.filteredPbs).forEach(([file, pbs]) => {
      core.debug(`${file}`);
      pbs.forEach((pb) => {
        core.debug(`  ${pb.code}`);
        core.debug(`    ${pb.message}`);
        core.debug(`    ${pb.severity}`);
        core.debug(`    ${pb.path}`);
      });
    });
    core.endGroup();

    core.debug(`Processed ${Object.keys(processedPbs.filteredPbs).length} PBs`);

    // Scope the gateway routes file to the PR's changed lines so pre-existing
    // violations on untouched routes neither fail the build nor spam the
    // comment. Every other file keeps its full report. On any lookup failure we
    // fall back to the full file rather than silently hiding findings.
    let octokit: ReturnType<typeof github.getOctokit> | undefined;
    if (!isDev) {
      octokit = github.getOctokit(inputs["github-token"]!);
      try {
        const changedLines = await getChangedLinesForPr(
          octokit,
          github.context,
          isGatewayRoutesPath,
        );
        // Widen changed lines to whole route blocks so route-level findings
        // (anchored at the `- id:` line) on an edited route are still caught.
        const gatewayContent = fileContents.find((f) =>
          isGatewayRoutesPath(f.file),
        )?.content;
        if (gatewayContent) {
          for (const [filename, lines] of changedLines) {
            if (lines !== null) {
              changedLines.set(
                filename,
                expandChangedLinesToBlocks(gatewayContent, lines),
              );
            }
          }
        }
        const before = Object.values(processedPbs.severitiesCount).reduce(
          (a, b) => a + b,
          0,
        );
        processedPbs = filterGatewayToChangedLines(processedPbs, changedLines);
        const after = Object.values(processedPbs.severitiesCount).reduce(
          (a, b) => a + b,
          0,
        );
        core.debug(
          `Gateway diff-scoping: ${before} -> ${after} findings after limiting sp-gateway-routes to changed lines`,
        );
      } catch (error) {
        core.warning(
          `Could not scope gateway findings to changed lines; reporting the full file. ${error}`,
        );
      }
    }

    core.debug("Generating markdown");

    // Generate markdown and post comment
    const markdown = await toMarkdown(processedPbs);

    core.debug("Checking comments");

    core.debug("Posting comment");

    if (markdown && !isDev) {
      // Always write the full, untruncated report to the job summary (~1 MiB
      // limit) so nothing is lost when the PR comment has to be shortened.
      try {
        await core.summary.addRaw(markdown).write();
      } catch (error) {
        core.warning(`Failed to write job summary: ${error}`);
      }

      // GitHub rejects comment bodies over 65,536 characters, so the comment
      // gets a truncated view with a pointer to the full report above.
      const runUrl =
        process.env.GITHUB_SERVER_URL &&
        process.env.GITHUB_REPOSITORY &&
        process.env.GITHUB_RUN_ID
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : undefined;
      const truncationFooter = `\n\n---\n\n> :warning: This report was truncated because it exceeded GitHub's comment size limit (65,536 characters). ${
        runUrl
          ? `See the full report in the [workflow run summary](${runUrl}).`
          : "See the full report in the workflow run summary."
      }\n`;
      const commentBody = truncateForComment(markdown, truncationFooter);

      const client = octokit ?? github.getOctokit(inputs["github-token"]!);
      const comment = await getGithubComment(client, github.context);
      if (comment) {
        core.debug("Updating comment");
        await updateGithubComment(
          comment.id,
          commentBody,
          client,
          github.context,
        );
      } else {
        core.debug("Creating comment");
        await createGithubComment(commentBody, client, github.context);
      }

      if (processedPbs.severitiesCount[0] > 0) {
        core.setFailed(
          `There are ${processedPbs.severitiesCount[0]} lint errors!`,
        );
      }
    } else if (isDev) {
      writeFileSync("../../packages/test-files/output.md", markdown);
    }
  } catch (error) {
    core.error(error as string | Error);
    core.setFailed(
      error instanceof Error
        ? error.message
        : `An unknown error occurred: ${error}`,
    );
  }
}

run();
