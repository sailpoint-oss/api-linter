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
import { createSpectral, initProcessedPbs, processPbs } from "./spectral.js";
import { readFilesToAnalyze } from "./read_files.js";
import { toMarkdown } from "./to_markdown.js";
import { getDevInputs } from "./config.js";
import { devLog, isDev } from "./utils.js";

async function run(): Promise<void> {
  try {
    // Get and validate inputs
    const inputs: ActionInputs = Object.fromEntries(
      Object.keys(getDevInputs()).map((key) => [
        key,
        core.getInput(key, { required: !isDev }) ||
          (isDev ? getDevInputs()[key as keyof ActionInputs] : undefined),
      ])
    );

    await validateInputs(inputs);

    core.debug("Loading project config");

    // Setup project configuration
    const project = getProjectConfig();

    // Read files and create Spectral instances
    const fileContents = await readFilesToAnalyze(
      project.workspace,
      inputs["file-glob"]!
    );

    core.debug("Creating spectral instances");

    const spectralInstances = {
      rootSpectral: await createSpectral(inputs["spectral-root-ruleset"]!),
      pathSpectral: await createSpectral(inputs["spectral-path-ruleset"]!),
      schemaSpectral: await createSpectral(inputs["spectral-schema-ruleset"]!),
    };

    core.debug("Running spectral analysis");

    // Run analysis
    const results = await runSpectralAnalysis(
      fileContents,
      spectralInstances,
      project.workspace
    );

    core.debug(JSON.stringify(results.map((r) => r.pbs), null, 2));

    core.debug("Processing results");

    // Process results
    let processedPbs = initProcessedPbs();
    results.forEach(({ file, pbs }) => {
      if (pbs) {
        processedPbs = processPbs(file, processedPbs, pbs);
      }
    });

    core.debug(`Processed ${processedPbs.filteredPbs.length} PBs`);
    core.debug(JSON.stringify(processedPbs.filteredPbs, null, 2));

    core.debug("Generating markdown");

    // Generate markdown and post comment
    const markdown = await toMarkdown(processedPbs);

    core.debug("Checking comments");

    if (markdown && !isDev) {
      const octokit = github.getOctokit(inputs["github-token"]!);
      const comment = await getGithubComment(octokit, github.context);
      if (comment) {
        core.debug("Updating comment");
        await updateGithubComment(comment.id, markdown, octokit, github.context);
      } else {
        core.debug("Creating comment");
        await createGithubComment(markdown, octokit, github.context);
      }

      if (processedPbs.severitiesCount[0] > 0) {
        core.setFailed(
          `There are ${processedPbs.severitiesCount[0]} lint errors!`
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
        : `An unknown error occurred: ${error}`
    );
  }
}

run();
