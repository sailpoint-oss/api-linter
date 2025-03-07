import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import github from "@actions/github";
import { Project } from './types.js';
import { devLog, isDev, ProjectRoot } from './utils.js';
import path from 'node:path';

interface ProcessedPbs {
  filteredPbs: {
    [ruleCode: string]: Array<ISpectralDiagnostic & { source: string }>;
  };
  severitiesCount: Record<number, number>;
}

const getSeverityEmoji = (severity: number): string => {
  switch (severity) {
    case 0:
      return ":x:"; // Error
    case 1:
      return ":warning:"; // Warning
    case 2:
      return ":information_source:"; // Info
    case 3:
      return ":eyes:"; // Hint
    default:
      return ":question:";
  }
};

const getSeverityLabel = (severity: number): string => {
  switch (severity) {
    case 0:
      return "Error";
    case 1:
      return "Warning";
    case 2:
      return "Info";
    case 3:
      return "Hint";
    default:
      return "Unknown";
  }
};
export function createFileLink(file: string, line: number, column: number): string {
  if (isDev) {
    return `${file.replace(ProjectRoot, '.').replace("/packages/test-files", "")}`;
  } else {
    return `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/blob/${process.env.GITHUB_HEAD_REF}/${file.replace(process.env.GITHUB_WORKSPACE!, '')}#L${line}`
  }
}

export function fromKebabCaseToTitleCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export const toMarkdown = async (processedPbs: ProcessedPbs): Promise<string> => {
  const { filteredPbs, severitiesCount } = processedPbs;

  // No issues found
  if (Object.keys(filteredPbs).length === 0) {
    return `# OpenAPI Linting Report

Last updated: ${new Date().toLocaleString()}

✅ No issues found. Great job! 🎉`;
  }

  const totalIssues = Object.values(severitiesCount).reduce((a, b) => a + b, 0);
  
  // Build the header
  let md = `# OpenAPI Linting Report

Last updated: ${new Date().toLocaleString()}

Found **${totalIssues}** total issues:
${[0, 1, 2, 3]
  .filter(severity => severitiesCount[severity] > 0)
  .map(severity => `- ${getSeverityEmoji(severity)} ${getSeverityLabel(severity)}: ${severitiesCount[severity]}`)
  .join('\n')}

---

`;

  // Sort rules by severity (errors first) and then by name
  const sortedRules = Object.entries(filteredPbs).sort(([ruleA, issuesA], [ruleB, issuesB]) => {
    const severityA = issuesA[0]?.severity ?? 999;
    const severityB = issuesB[0]?.severity ?? 999;
    if (severityA !== severityB) return severityA - severityB;
    return ruleA.localeCompare(ruleB);
  });

  // Build the issues section
  sortedRules.forEach(([ruleName, issues]) => {
    const severity = issues[0]?.severity ?? 0;
    
    md += `<details open><summary>${getSeverityEmoji(severity)} ${fromKebabCaseToTitleCase(ruleName)} (${issues.length})</summary>\n\n`;
    
    // Group issues by file
    const issuesByFile = issues.reduce((acc, issue) => {
      const file = issue.source;
      if (!acc[file]) acc[file] = [];
      acc[file].push(issue);
      return acc;
    }, {} as Record<string, typeof issues>);

    Object.entries(issuesByFile).forEach(([file, fileIssues]) => {   
      md += `\n\n- File: \`${file.replace(process.env.GITHUB_WORKSPACE! || ProjectRoot, '')} (${fileIssues.length})\`\n\n`;
      fileIssues.forEach(issue => {
        md += `   - **[Line ${issue.range.start.line + 1}](${createFileLink(issue.source, issue.range.start.line + 1, issue.range.start.character)})**: ${issue.message.replaceAll("'", "`")}\n`;
      });
      
      md += `\n\n`;
    });

    md += `</details>\n\n`;
  });

  return md;
};
