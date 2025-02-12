import core from "@actions/core";
import github from "@actions/github";
import {
  validateInputs,
  getProjectConfig,
  runSpectralAnalysis,
  createGithubComment,
} from "../action.js";
import { ActionInputs } from "../types.js";
import { createSpectral } from "../spectral.js";
import { readFilesToAnalyze } from "../read_files.js";
import { initProcessedPbs, processPbs } from "../process_pbs.js";
import { toMarkdown } from "../to_markdown.js";
import { getDevInputs } from "../config.js";

async function run(): Promise<void> {
  try {
    const isDev =
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

    // Get and validate inputs
    const inputs: ActionInputs = Object.fromEntries(
      Object.keys(getDevInputs()).map((key) => [
        key,
        core.getInput(key, { required: !isDev }) ||
          (isDev ? getDevInputs()[key as keyof ActionInputs] : undefined),
      ])
    );

    await validateInputs(inputs, isDev);

    // Setup project configuration
    const project = getProjectConfig();

    // Read files and create Spectral instances
    const fileContents = await readFilesToAnalyze(
      project.workspace,
      inputs["file-glob"]!
    );

    const spectralInstances = {
      rootSpectral: await createSpectral(inputs["spectral-root-ruleset"]!),
      pathSpectral: await createSpectral(inputs["spectral-path-ruleset"]!),
      schemaSpectral: await createSpectral(inputs["spectral-schema-ruleset"]!),
    };

    // Run analysis
    const results = await runSpectralAnalysis(
      fileContents,
      spectralInstances,
      project.workspace
    );

    // Process results
    let processedPbs = initProcessedPbs();
    results.forEach(({ file, pbs }) => {
      if (pbs) {
        processedPbs = processPbs(file, processedPbs, pbs);
      }
    });

    // Generate markdown and post comment
    const markdown = await toMarkdown(processedPbs, project);

    if (markdown && !isDev) {
      const octokit = github.getOctokit(inputs["github-token"]!);
      await createGithubComment(markdown, octokit, github.context);

      if (processedPbs.severitiesCount[0] > 0) {
        core.setFailed(
          `There are ${processedPbs.severitiesCount[0]} lint errors!`
        );
      }
    } else if (isDev) {
      console.log(markdown);
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
