const emojisMap = {
    '0': ':x:',
    '1': ':warning:',
    '2': ':information_source:',
    '3': ':eyes:'
  };
  
  const buildRelativeFilePath = (absFilePath, projectDir) => {
    return absFilePath.replace(`${projectDir}/`, '');
  };
  
  const buildNote = (pb, project, relativeFilePath) => {
    const line = pb.range.start.line + 1;
    const column = pb.range.start.character + 1;
    let link = '';
    
    if (project.githubURL === undefined || project.githubURL === "") {
      link = `/Users/tyler.mairose/development/api-linter/github-spectral-comment/${relativeFilePath}#L${line}`;
    } else {
      link = `${project.githubURL}/${project.repository}/blob/${project.headRef}/${relativeFilePath}#L${line}`;
    }
    return `|[${relativeFilePath}:${line}:${column}](${link})|${emojisMap[pb.severity]}|${pb.code}|${pb.message}|`;
  };
  
  const buildNotes = (pbs, project, absFilePath) => {
    const relativeFilePath = buildRelativeFilePath(absFilePath, project.workspace);
    let md = `> ${relativeFilePath}
  
  |File Location|Severity|Rule Name|Message|
  |-------------|--------|---------|-------|
  `;
  
    for (let i = 0; i < pbs.length; i++) {
      md += buildNote(pbs[i], project, relativeFilePath) + '\n';
    }
    return md;
  };
  
  export { buildRelativeFilePath, buildNote, buildNotes };
  