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

    core.debug("Generating markdown");

    // Generate markdown and post comment
    const markdown = await toMarkdown(processedPbs);

    core.debug("Checking comments");

    core.debug("Posting comment");

    if (markdown && !isDev) {
      const octokit = github.getOctokit(inputs["github-token"]!);
      const comment = await getGithubComment(octokit, github.context);
      if (comment) {
        core.debug("Updating comment");
        await updateGithubComment(
          comment.id,
          markdown,
          octokit,
          github.context,
        );
      } else {
        core.debug("Creating comment");
        await createGithubComment(markdown, octokit, github.context);
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
