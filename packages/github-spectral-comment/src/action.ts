import core from "@actions/core";
import { ActionInputs, Project, SpectralAnalysisResult } from "./types.js";
import path from "path";
import github from "@actions/github";
import { runSpectral } from "./spectral.js";
import { isDev } from "./utils.js";

export async function validateInputs(inputs: ActionInputs): Promise<void> {
  if (!isDev) {
    const missingInputs = Object.entries(inputs)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
    if (missingInputs.length > 0) {
      throw new Error(`Missing required inputs: ${missingInputs.join(", ")}`);
    }
  }
}

export function getProjectConfig(workspace?: string): Project {
  let projectConfig: Project;
  if (isDev) {
   projectConfig = {
      "github-url": undefined,
      repository: undefined,
      headRef: undefined,
      workspace: workspace ||  path.resolve()
   }
  } else {
    projectConfig = {
      "github-url": process.env.GITHUB_URL,
      repository: process.env.GITHUB_REPOSITORY,
      headRef: process.env.GITHUB_HEAD_REF,
      workspace: workspace || process.env.GITHUB_WORKSPACE || path.resolve(),
    }
  }
  core.debug(`Project config: ${JSON.stringify(projectConfig)}`);
  return projectConfig;
}

export async function runSpectralAnalysis(
  fileContents: Array<{ file: string; content: string }>,
  spectralInstances: {
    rootSpectral: any;
    pathSpectral: any;
    schemaSpectral: any;
  },
  workspace: string
): Promise<SpectralAnalysisResult[]> {
  const spectralTasks = fileContents.map(async (fileContent) => {
    const file = fileContent.file;
    let pbs

    if (file.includes("sailpoint-api.")) {
      pbs = await runSpectral(spectralInstances.rootSpectral, fileContent, workspace, false);
    } else if (file.includes("paths")) {
      pbs = await runSpectral(spectralInstances.pathSpectral, fileContent, workspace, true);
    } else if (file.includes("schema")) {
      pbs = await runSpectral(spectralInstances.schemaSpectral, fileContent, workspace, true);
    }

    return { file, pbs };
  });

  const results = await Promise.allSettled(spectralTasks);
  return results
    .filter((result): result is PromiseFulfilledResult<SpectralAnalysisResult> => 
      result.status === "fulfilled")
    .map(result => result.value);
}

export async function getGithubComment(
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context
) {
  if (!context.payload.pull_request) {
    throw new Error("No pull request found! Please create a pull request to use this action.");
  }

  const { data } = await octokit.rest.issues.listComments({
    repo: context.repo.repo,
    owner: context.repo.owner,
    issue_number: context.payload.pull_request.number,
  });

  core.debug(`Found ${data.length} comments`);

  core.debug(JSON.stringify(data, null, 2));

  const comments = data.filter((comment) => comment?.user?.login === "github-actions[bot]" && comment?.body?.includes("Last updated"))
  core.debug(`Found ${comments.length} matching comments`);

  let comment

  if (comments.length < 1) {
    return undefined;
  } else if (comments.length === 1) {
    comment = comments[0];
  } else {
    comment = comments[comments.length - 1];
  }

  core.debug(`Found comment ${comment?.id || "unknown"}, posted by ${comment?.user?.login || "unknown"}`);

  if (!comment) {
    return undefined
  }

  return comment;
}

export async function updateGithubComment(
  commentId: number,
  markdown: string,
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context
): Promise<void> {
  if (!context.payload.pull_request) {
    throw new Error("No pull request found! Please create a pull request to use this action.");
  }

  await octokit.rest.issues.updateComment({
    repo: context.repo.repo,
    owner: context.repo.owner,
    comment_id: commentId,
    body: markdown,
  });
}

export async function createGithubComment(
  markdown: string,
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context
): Promise<void> {
  if (!context.payload.pull_request) {
    throw new Error("No pull request found! Please create a pull request to use this action.");
  }

  await octokit.rest.issues.createComment({
    repo: context.repo.repo,
    owner: context.repo.owner,
    body: markdown,
    issue_number: context.payload.pull_request.number,
  });
} 
