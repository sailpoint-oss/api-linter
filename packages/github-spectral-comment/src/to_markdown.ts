import { buildNotes } from "./note_builder.js";

const toMarkdown = async (processedPbs: any, project: any) => {
  const pbsMap = processedPbs.filteredPbs;

  // no pb => no message
  if (Object.keys(pbsMap).length === 0) {
    return "";
  }

  const { severitiesCount } = processedPbs;
  const nbErrors = severitiesCount[0];
  const nbWarnings = severitiesCount[1];
  const nbInfos = severitiesCount[2];
  const nbHints = severitiesCount[3];
  const nbPbs = nbErrors + nbWarnings + nbInfos + nbHints;

  let md = `# OpenAPI linting report 
Last updated: ${new Date().toLocaleDateString()}

## Summary
${nbPbs === 0 ? "No issues found" : `Found ${nbPbs} issues`}
${nbErrors > 0 ? `- Errors: ${nbErrors}` : ""}
${nbWarnings > 0 ? `- Warnings: ${nbWarnings}` : ""}
${nbInfos > 0 ? `- Infos: ${nbInfos}` : ""}
${nbHints > 0 ? `- Hints: ${nbHints}` : ""}

<details open>
<summary>OpenAPI linting report</summary>
`;

  for (const absFilePath in pbsMap) {
    if (Object.prototype.hasOwnProperty.call(pbsMap, absFilePath)) {
      const pbs = pbsMap[absFilePath];
      md += buildNotes(pbs, project, absFilePath);
      md += "\n";
    }
  }

  md += `</details>`;
  return md;
};

export { toMarkdown };
