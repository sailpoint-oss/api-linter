import { readFilesToAnalyze } from "./read_files.js";
import { createSpectral, runSpectral } from "./spectral.js";
import { initProcessedPbs, processPbs } from "./process_pbs.js";
import { toMarkdown } from "./to_markdown.js";
import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const context = github.context;

    if (Object.keys(context.payload).length != 0) {
      if (!context.payload.pull_request) {
        core.error("this action only works on pull_request events");
        core.setOutput("comment-created", "false");
        return;
      }
    }

    const inputs = {
      githubToken: core.getInput("github-token"),
      fileGlob:
        core.getInput("file-glob") ||
        "../api-specs/src/main/yaml/v3/paths/access-profiles.yaml",
      spectralRootRuleset:
        core.getInput("spectral-root-ruleset") || "../../root-ruleset.yaml",
      spectralPathRuleset:
        core.getInput("spectral-path-ruleset") || "../../path-ruleset.yaml",
      spectralSchemaRuleset:
        core.getInput("spectral-schema-ruleset") || "../../schema-ruleset.yaml",
      githubURL: core.getInput("github-url"),
    };

    const project = {
      githubURL: inputs.githubURL,
      repository: process.env.GITHUB_REPOSITORY,
      headRef: process.env.GITHUB_HEAD_REF,
      workspace:
        process.env.GITHUB_WORKSPACE ||
        "/Users/tyler.mairose/development/api-linter/github-spectral-comment",
    };

    console.log("Workspace:" + project.workspace);
    console.log("FileGlob: " + inputs.fileGlob);
    console.log("File Path: " + project.workspace + "/" + inputs.fileGlob);

    const fileContents = await readFilesToAnalyze(
      project.workspace,
      inputs.fileGlob
    );

    const rootSpectral = await createSpectral(inputs.spectralRootRuleset);
    const pathSpectral = await createSpectral(inputs.spectralPathRuleset);
    const schemaSpectral = await createSpectral(inputs.spectralSchemaRuleset);

    let processedPbs = initProcessedPbs();

    for (var i = 0, len = fileContents.length; i < len; i++) {
      console.log(
        "Changing Directory to: " +
          fileContents[i].file.substr(0, fileContents[i].file.lastIndexOf("/"))
      );

      process.chdir(
        project.workspace +
          "/" +
          fileContents[i].file.substr(0, fileContents[i].file.lastIndexOf("/"))
      );

      let pbs = "";

      if (fileContents[i].file.includes(`sailpoint-api.`)) {
        console.log(`Running root ruleset on ${fileContents[i].file}`);
        pbs = await runSpectral(
          rootSpectral,
          fileContents[i],
          project.workspace,
          false
        );
      } else if (fileContents[i].file.includes(`paths`)) {
        console.log(`Running path ruleset on ${fileContents[i].file}`);
        pbs = await runSpectral(
          pathSpectral,
          fileContents[i],
          project.workspace,
          true
        );
      } else if (fileContents[i].file.includes(`schema`)) {
        console.log(`Running schema ruleset on ${fileContents[i].file}`);
        pbs = await runSpectral(
          schemaSpectral,
          fileContents[i],
          project.workspace,
          true
        );
      }

      console.log(`Current Working Directory: ` + process.cwd());

      if (pbs !== '') {
        processedPbs = processPbs(fileContents[i].file, processedPbs, pbs);
      }
    }

    const md = await toMarkdown(processedPbs, project);

    if (Object.keys(context.payload).length != 0) {
      if (md === "") {
        core.info("No lint error found! Congratulation!");
      } else {
        const octokit = new github.getOctokit(inputs.githubToken);
        const repoName = context.repo.repo;
        const repoOwner = context.repo.owner;
        const prNumber = context.payload.pull_request.number;
        await octokit.issues.createComment({
          repo: repoName,
          owner: repoOwner,
          body: md,
          issue_number: prNumber,
        });
        if (processedPbs.severitiesCount[0] > 0) {
          core.setFailed(
            "There are " + processedPbs.severitiesCount[0] + " lint errors!"
          );
        }
      }
    } else {
      console.log(md);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
