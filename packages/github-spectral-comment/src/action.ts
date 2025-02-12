import { ActionInputs, Project, SpectralAnalysisResult } from "./types.js";
import { Spectral } from "@stoplight/spectral-core";
import path from "path";
import github from "@actions/github";
import { runSpectral } from "./spectral.js";

export async function validateInputs(inputs: ActionInputs, isDev: boolean): Promise<void> {
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
  return {
    "github-url": process.env.GITHUB_URL,
    repository: process.env.GITHUB_REPOSITORY,
    headRef: process.env.GITHUB_HEAD_REF,
    workspace: workspace || process.env.GITHUB_WORKSPACE || path.resolve(),
  };
}

export async function runSpectralAnalysis(
  fileContents: Array<{ file: string; content: string }>,
  spectralInstances: {
    rootSpectral: Spectral;
    pathSpectral: Spectral;
    schemaSpectral: Spectral;
  },
  workspace: string
): Promise<SpectralAnalysisResult[]> {
  const spectralTasks = fileContents.map(async (fileContent) => {
    const file = fileContent.file;
    let pbs;

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