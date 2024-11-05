import * as fs from "node:fs";

export const readFilesToAnalyze = async (githubWorkspace, fileGlob) => {
  const files = fileGlob.split(",");
  const fileContents = [];

  for (let i = 0, len = files.length; i < len; i++) {
    console.log(`FILE ${i} ${githubWorkspace}${files[i]}`);
    let filePath = `${githubWorkspace}/${files[i]}`
    try {
      if (fs.existsSync(filePath)) {
        console.log("File Exists, adding it to be linted");
        fileContents.push({
          file: files[i],
          content: fs.readFileSync(filePath, "utf-8"),
        });
      } else {
        console.log("File does not exist, if the file was intentionally deleted during the PR ignore this comment");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return fileContents;
};
