export const emojisMap: Record<string, string> = {
  "0": ":x:",
  "1": ":warning:",
  "2": ":information_source:",
  "3": ":eyes:",
};

export const buildRelativeFilePath = (
  absFilePath: string,
  projectDir: string
) => {
  return absFilePath.replace(`${projectDir}/`, "");
};

export const buildNote = (pb: any, project: any, relativeFilePath: string) => {
  const line = pb.range.start.line + 1;
  const column = pb.range.start.character + 1;

  let link =  `${project.githubURL}/${project.repository}/blob/${project.headRef}/${relativeFilePath}#L${line}`;

  return `|[${relativeFilePath}:${line}:${column}](${link})|${emojisMap[pb.severity]}|${pb.code}|${pb.message}|`;
};

export const buildNotes = (pbs: any, project: any, absFilePath: string) => {
  const relativeFilePath = buildRelativeFilePath(
    absFilePath,
    project.workspace
  );
  let md = `> ${relativeFilePath}
  
  |File Location|Severity|Rule Name|Message|
  |-------------|--------|---------|-------|
  `;

  for (let i = 0; i < pbs.length; i++) {
    md += buildNote(pbs[i], project, relativeFilePath) + "\n";
  }
  return md;
};
