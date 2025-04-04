import { ISpectralFullResult } from "@stoplight/spectral-core";

export interface Project {
  "github-url": string | undefined;
  repository: string | undefined;
  headRef: string | undefined;
  workspace: string;
}

export interface ActionInputs {
  "github-token"?: string;
  "file-glob"?: string;
  "spectral-root-ruleset"?: string;
  "spectral-path-ruleset"?: string;
  "spectral-schema-ruleset"?: string;
  "spectral-gateway-ruleset"?: string;
  "github-url"?: string;
}

export interface SpectralAnalysisResult {
  file: string;
  pbs: ISpectralFullResult;
}
