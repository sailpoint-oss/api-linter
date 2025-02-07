import core from "@actions/core";
import github from "@actions/github";
import { initProcessedPbs, processPbs } from "./process_pbs.js";
import { readFilesToAnalyze } from "./read_files.js";
import { createSpectral, runSpectral } from "./spectral.js";
import { toMarkdown } from "./to_markdown.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

core.info("Starting API Linter");
core.debug("Debug mode is enabled");
const dev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
core.debug(`Node Environment: ${process.env.NODE_ENV}, dev: ${dev}`);

function devLog(message?: any) {
  if (dev) {
    console.log(message);
  }
}

type Inputs = {
  "github-token"?: string,
  "file-glob"?: string,
  "spectral-root-ruleset"?: string,
  "spectral-path-ruleset"?: string,
  "spectral-schema-ruleset"?: string,
  "github-url"?: string,
};

const inputs: Inputs = {
  "github-token": undefined,
  "file-glob": undefined,
  "spectral-root-ruleset": undefined,
  "spectral-path-ruleset": undefined,
  "spectral-schema-ruleset": undefined,
  "github-url": undefined,
};

const devInputs: Inputs = {
  "github-token": "",
  "file-glob": "../api-specs/idn/v3/paths/access-profiles.yaml",
  "spectral-root-ruleset":  "../../sailpoint-rulesets/root-ruleset.yaml",
  "spectral-path-ruleset":  "../../sailpoint-rulesets/path-ruleset.yaml",
  "spectral-schema-ruleset":  "../../sailpoint-rulesets/schema-ruleset.yaml",
  "github-url": "",
};

try {

  // Startup Checks
  if (Object.keys(github.context.payload).length != 0) {
    if (!github.context.payload.pull_request) {
      core.setOutput("comment-created", "false");
      throw new Error("this action only works on pull_request events");
    }
  }
  //Check Inputs
  for (const key of Object.keys(inputs) as (keyof Inputs)[]) {
    inputs[key] = core.getInput(key, { required: !dev });
    if (dev && inputs[key] === "") {
      inputs[key] = devInputs[key];
    }
  }

  devLog("Inputs:")
  devLog(inputs)

  const project = {
    githubURL: inputs.githubURL,
    repository: process.env.GITHUB_REPOSITORY,
    headRef: process.env.GITHUB_HEAD_REF,
    workspace:
      process.env.GITHUB_WORKSPACE ||
      path.join(__dirname, "../../../"),
  };

  devLog("Project:")
  devLog(project);

  devLog("Workspace: " + project.workspace);
  devLog("FileGlob: " + inputs.fileGlob);
  devLog("File Path: " + path.join(project.workspace, inputs.fileGlob!));

  const fileContents = await core.group('Reading files to analyze', async () => {
    return await readFilesToAnalyze(
      project.workspace,
      inputs.fileGlob!
    );
  });

  const { rootSpectral, pathSpectral, schemaSpectral } = await core.group('Creating spectral instances', async () => {
    const rootSpectral = await createSpectral(inputs.spectralRootRuleset!);
    const pathSpectral = await createSpectral(inputs.spectralPathRuleset!);
    const schemaSpectral = await createSpectral(inputs.spectralSchemaRuleset!);
    return { rootSpectral, pathSpectral, schemaSpectral };
  });

  let processedPbs = initProcessedPbs();
  
  processedPbs = await core.group('Running spectral analysis', async () => {
    const spectralTasks = fileContents.map(async (fileContent) => {
      const file = fileContent.file;
      const fileDir = file.substring(0, file.lastIndexOf("/"));
      console.log("Processing file: " + file);
      // Instead of changing the global working directory, compute the absolute directory
      const absoluteDir = path.join(project.workspace, fileDir);
      console.log("File directory: " + absoluteDir);
    
      let pbs = "";
      if (file.includes("sailpoint-api.")) {
        console.log(`Running root ruleset on ${file}`);
        pbs = await runSpectral(rootSpectral, fileContent, project.workspace, false);
      } else if (file.includes("paths")) {
        console.log(`Running path ruleset on ${file}`);
        pbs = await runSpectral(pathSpectral, fileContent, project.workspace, true);
      } else if (file.includes("schema")) {
        console.log(`Running schema ruleset on ${file}`);
        pbs = await runSpectral(schemaSpectral, fileContent, project.workspace, true);
      }
      return { file, pbs };
    });
    
    const results = await Promise.allSettled(spectralTasks);
    results.forEach(result => {
      if (result.status === "fulfilled") {
        const { file, pbs } = result.value;
        if (pbs !== '') {
          processedPbs = processPbs(file, processedPbs, pbs);
        }
      } else {
        core.error(`Error processing file: ${JSON.stringify(result.reason)}`);
      }
    });
    return processedPbs;
  });

  await core.group('Posting GitHub comment', async () => {
    const md = await toMarkdown(processedPbs, project);
  
    if (Object.keys(github.context.payload).length != 0) {
      if (md === "") {
        core.info("No lint errors found! Congratulations!");
      } else if (github.context.payload.pull_request == null) {
        core.setFailed("No pull request found! Please create a pull request to use this action.");
      } else {
        const octokit = github.getOctokit(inputs.githubToken!);
        const repoName = github.context.repo.repo;
        const repoOwner = github.context.repo.owner;
        const prNumber = github.context.payload.pull_request.number;
        await octokit.rest.issues.createComment({
          repo: repoName,
          owner: repoOwner,
          body: md,
          issue_number: prNumber,
        });
        if (processedPbs.severitiesCount[0] > 0) {
          core.setFailed("There are " + processedPbs.severitiesCount[0] + " lint errors!");
        }
      }
    } else {
      console.log(md);
    }
  });
} catch (error) {
  core.error(error as string | Error);
  if (error instanceof Error) {
    core.setFailed(error.message);
  } else {
    core.setFailed(`An unknown error occurred: ${JSON.stringify(error)}`);
  }
}

