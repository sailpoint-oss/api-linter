import * as fs from "node:fs";
import path from "node:path";

export const readFilesToAnalyze = async (
  githubWorkspace: string,
  fileGlob: string,
) => {
  const files = fileGlob.split(",");
  const fileContents = [];

  for (let i = 0, len = files.length; i < len; i++) {
    console.log(`FILE ${i} ${path.join(githubWorkspace, files[i])}`);
    let filePath = path.join(githubWorkspace, files[i]);

    if (filePath.includes(".github")) {
      console.log("Skipping GitHub Action files");
      continue;
    }
    try {
      if (fs.existsSync(filePath)) {
        console.log("File Exists, adding it to be linted");
        fileContents.push({
          file: files[i],
          content: fs.readFileSync(filePath, "utf-8"),
        });
      } else {
        console.log(
          "File does not exist, if the file was intentionally deleted during the PR ignore this comment",
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  return fileContents;
};
