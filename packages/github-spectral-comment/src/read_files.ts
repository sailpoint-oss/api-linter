import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { devLog } from "./utils.js";
import core from "@actions/core";

export const readFilesToAnalyze = async (githubWorkspace: string, fileGlob: string) => {
  const files = fileGlob.split(",");
  const fileContents = [];

  for (let i = 0, len = files.length; i < len; i++) {
    const filePath = path.join(githubWorkspace, files[i]);
    console.log(`Checking File #${i} ${filePath}`);

    if (filePath.includes(".github")) {
      console.log("Skipping GitHub Action files");
      continue;
    }
    try {
      if (existsSync(filePath)) {
        console.log("File Exists, adding it to be linted");
        fileContents.push({
          file: files[i],
          content: readFileSync(filePath, "utf-8"),
        });
      } else {
        core.warning("File does not exist, if the file was intentionally deleted during the PR ignore this comment");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return fileContents;
};
