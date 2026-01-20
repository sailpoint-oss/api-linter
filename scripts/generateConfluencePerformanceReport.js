import fs from "node:fs";
import path from "node:path";

function stripOuterWrapperQuotes(raw) {
  const text = raw.trim();
  // The input sometimes arrives wrapped in a single outer quote, producing:
  // ""SERVICE",...<newline>...<newline>"
  if (text.startsWith('""SERVICE"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  return text;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    // Ignore completely empty trailing row.
    if (row.length === 1 && row[0] === "") return;
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          // Escaped quote.
          field += '"';
          i += 2;
          continue;
        }
        // Closing quote.
        inQuotes = false;
        i += 1;
        continue;
      }

      field += ch;
      i += 1;
      continue;
    }

    // Not in quotes
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ",") {
      pushField();
      i += 1;
      continue;
    }

    if (ch === "\n") {
      pushField();
      pushRow();
      i += 1;
      continue;
    }

    if (ch === "\r") {
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  // Flush last field/row.
  pushField();
  if (row.length > 0) pushRow();

  return rows;
}

function toNumber(value) {
  const n = Number.parseFloat(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

function formatSecondsFromNs(ns) {
  if (ns == null) return "";
  return `${(ns / 1e9).toFixed(3)}s`;
}

function confluenceEscapeCell(text) {
  // Avoid accidental table breaks.
  return String(text ?? "").replaceAll("|", "\\|");
}

function markdownEscapeCell(text) {
  // Avoid accidental table breaks.
  return String(text ?? "").replaceAll("|", "\\|");
}

function buildModel(records) {
  // Filter obvious junk.
  const filtered = records.filter((r) => r.service && r.controllerAction);

  const overallTotal = filtered.find(
    (r) =>
      r.service === "__TOTAL__" &&
      r.controllerAction === "__TOTAL__" &&
      r.tenant === "__TOTAL__",
  );

  const byService = new Map();
  for (const r of filtered) {
    if (r.service === "__TOTAL__") continue;
    if (!byService.has(r.service)) byService.set(r.service, []);
    byService.get(r.service).push(r);
  }

  const services = [];
  for (const [service, serviceRecords] of byService.entries()) {
    const serviceTotal = serviceRecords.find(
      (r) => r.controllerAction === "__TOTAL__" && r.tenant === "__TOTAL__",
    );

    const byController = new Map();
    for (const r of serviceRecords) {
      if (r.controllerAction === "__TOTAL__") continue;
      if (!byController.has(r.controllerAction)) byController.set(r.controllerAction, []);
      byController.get(r.controllerAction).push(r);
    }

    const controllers = [];
    for (const [controllerAction, controllerRecords] of byController.entries()) {
      const controllerTotal = controllerRecords.find((r) => r.tenant === "__TOTAL__");
      const tenants = controllerRecords
        .filter((r) => r.tenant !== "__TOTAL__")
        .map((r) => ({
          tenant: r.tenant === "" ? "(blank)" : r.tenant,
          durationNs: r.durationNs,
          count: r.count,
        }))
        .sort((a, b) => (b.durationNs ?? -Infinity) - (a.durationNs ?? -Infinity));

      const slowestTenantNs = tenants.length > 0 ? tenants[0].durationNs : null;
      const slowestOverallNs = Math.max(
        slowestTenantNs ?? -Infinity,
        controllerTotal?.durationNs ?? -Infinity,
      );

      controllers.push({
        controllerAction,
        controllerTotal,
        tenants,
        slowestOverallNs: Number.isFinite(slowestOverallNs) ? slowestOverallNs : null,
      });
    }

    controllers.sort(
      (a, b) => (b.slowestOverallNs ?? -Infinity) - (a.slowestOverallNs ?? -Infinity),
    );

    const slowestInServiceNs =
      controllers.length > 0
        ? controllers[0].slowestOverallNs
        : serviceTotal?.durationNs ?? null;

    services.push({
      service,
      serviceTotal,
      controllers,
      slowestInServiceNs,
    });
  }

  services.sort((a, b) => (b.slowestInServiceNs ?? -Infinity) - (a.slowestInServiceNs ?? -Infinity));

  return { overallTotal, services };
}

function buildConfluenceWikiReport(model) {
  const { overallTotal, services } = model;
  const lines = [];
  lines.push("h1. Confluence Performance Report (PC99)");
  lines.push("");
  lines.push(
    `Generated from CSV. Grouped by service, then controller/action. Durations are shown in seconds (converted from nanoseconds). Controllers are sorted by their slowest PC99 duration (desc). Tenants are listed slowest→fastest within each controller/action.`,
  );
  lines.push("");

  if (overallTotal) {
    lines.push("h2. Overall");
    lines.push("");
    lines.push("||Metric||Value||");
    lines.push(
      `|PC99 Duration|${confluenceEscapeCell(formatSecondsFromNs(overallTotal.durationNs))}|`,
    );
    lines.push(`|Count|${confluenceEscapeCell(overallTotal.count ?? "")}|`);
    lines.push("");
  }

  for (const svc of services) {
    lines.push(`h2. Service: ${confluenceEscapeCell(svc.service)}`);
    lines.push("");
    if (svc.serviceTotal) {
      lines.push("||Service Total PC99||Service Total Count||");
      lines.push(
        `|${confluenceEscapeCell(formatSecondsFromNs(svc.serviceTotal.durationNs))}|${confluenceEscapeCell(svc.serviceTotal.count ?? "")}|`,
      );
      lines.push("");
    }

    lines.push(
      "||Controller & Action||PC99 (slowest duration)||Controller __TOTAL__ PC99||Controller __TOTAL__ Count||Tenants (slowest→fastest)||",
    );

    for (const c of svc.controllers) {
      const controllerTotalNs = c.controllerTotal?.durationNs ?? null;
      const controllerTotalCount = c.controllerTotal?.count ?? "";

      const tenantsCell = (() => {
        if (c.tenants.length === 0) return "";

        const tenantHeader = "TENANT";
        const pc99Header = "PC99";
        const countHeader = "COUNT";

        const tenantWidth = Math.max(tenantHeader.length, ...c.tenants.map((t) => t.tenant.length));
        const pc99Values = c.tenants.map((t) => formatSecondsFromNs(t.durationNs));
        const pc99Width = Math.max(pc99Header.length, ...pc99Values.map((v) => v.length));
        const countValues = c.tenants.map((t) => String(t.count ?? ""));
        const countWidth = Math.max(countHeader.length, ...countValues.map((v) => v.length));

        const subLines = [];
        subLines.push(
          `${padRight(tenantHeader, tenantWidth)}  ${padRight(pc99Header, pc99Width)}  ${padRight(countHeader, countWidth)}`,
        );
        subLines.push(
          `${"-".repeat(tenantWidth)}  ${"-".repeat(pc99Width)}  ${"-".repeat(countWidth)}`,
        );

        for (let i = 0; i < c.tenants.length; i += 1) {
          subLines.push(
            `${padRight(c.tenants[i].tenant, tenantWidth)}  ${padRight(pc99Values[i], pc99Width)}  ${padRight(countValues[i], countWidth)}`,
          );
        }

        // Preserve alignment inside a table cell via monospace per-line.
        return subLines.map((l) => `{{${l}}}`).join("\\\\");
      })();

      lines.push(
        `|${confluenceEscapeCell(c.controllerAction)}|${confluenceEscapeCell(formatSecondsFromNs(c.slowestOverallNs))}|${confluenceEscapeCell(formatSecondsFromNs(controllerTotalNs))}|${confluenceEscapeCell(controllerTotalCount)}|${tenantsCell}|`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

function markdownTableRow(cells) {
  return `| ${cells.join(" | ")} |`;
}

function padRight(text, width) {
  const s = String(text ?? "");
  if (s.length >= width) return s;
  return s + " ".repeat(width - s.length);
}

function buildMarkdownReport(model) {
  const { overallTotal, services } = model;

  const lines = [];
  lines.push("# Confluence Performance Report (PC99)");
  lines.push("");
  lines.push(
    "Generated from CSV. Grouped by service, then controller/action. Durations are shown in seconds (converted from nanoseconds). Controllers are sorted by their slowest PC99 duration (desc). Tenants are listed slowest→fastest within each controller/action.",
  );
  lines.push("");

  if (overallTotal) {
    lines.push("## Overall");
    lines.push("");
    lines.push(markdownTableRow(["Metric", "Value"]));
    lines.push(markdownTableRow(["---", "---"]));
    lines.push(
      markdownTableRow([
        "PC99 Duration",
        `${markdownEscapeCell(formatSecondsFromNs(overallTotal.durationNs))}`,
      ]),
    );
    lines.push(markdownTableRow(["Count", `${markdownEscapeCell(overallTotal.count ?? "")}`]));
    lines.push("");
  }

  for (const svc of services) {
    lines.push(`## Service: ${markdownEscapeCell(svc.service)}`);
    lines.push("");

    if (svc.serviceTotal) {
      lines.push(markdownTableRow(["Service Total PC99", "Service Total Count"]));
      lines.push(markdownTableRow(["---", "---"]));
      lines.push(
        markdownTableRow([
          `${markdownEscapeCell(formatSecondsFromNs(svc.serviceTotal.durationNs))}`,
          `${markdownEscapeCell(svc.serviceTotal.count ?? "")}`,
        ]),
      );
      lines.push("");
    }

    lines.push(
      markdownTableRow([
        "Controller & Action",
        "PC99 (slowest duration)",
        "Controller __TOTAL__ PC99",
        "Controller __TOTAL__ Count",
        "Tenants (slowest→fastest)",
      ]),
    );
    lines.push(markdownTableRow(["---", "---", "---", "---", "---"]));

    for (const c of svc.controllers) {
      const controllerTotalNs = c.controllerTotal?.durationNs ?? null;
      const controllerTotalCount = c.controllerTotal?.count ?? "";
      const tenantsCell =
        c.tenants.length === 0
          ? ""
          : c.tenants
              .map(
                (t) =>
                  `${markdownEscapeCell(t.tenant)}: ${markdownEscapeCell(formatSecondsFromNs(t.durationNs))}, count ${markdownEscapeCell(t.count ?? "")}`,
              )
              .join("<br/>");

      lines.push(
        markdownTableRow([
          markdownEscapeCell(c.controllerAction),
          `${markdownEscapeCell(formatSecondsFromNs(c.slowestOverallNs))}`,
          `${markdownEscapeCell(formatSecondsFromNs(controllerTotalNs))}`,
          `${markdownEscapeCell(controllerTotalCount)}`,
          tenantsCell,
        ]),
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1];

  const raw = inputPath ? fs.readFileSync(inputPath, "utf8") : fs.readFileSync(0, "utf8");
  const cleaned = stripOuterWrapperQuotes(raw);

  const rows = parseCsv(cleaned).filter((r) => r.some((v) => String(v ?? "").trim() !== ""));
  if (rows.length < 2) {
    console.error("No CSV data found.");
    process.exit(1);
  }

  const header = rows[0].map((h) => String(h).trim());
  const idx = (name) => header.indexOf(name);

  const serviceIdx = idx("SERVICE");
  const controllerIdx = idx("#CONTROLLER_AND_ACTION");
  const tenantIdx = idx("TENANT");
  const durationIdx = idx("PC99:DURATION");
  const countIdx = idx("COUNT");

  if ([serviceIdx, controllerIdx, tenantIdx, durationIdx, countIdx].some((n) => n < 0)) {
    console.error(`Unexpected CSV header: ${header.join(", ")}`);
    process.exit(1);
  }

  const records = rows.slice(1).map((r) => ({
    service: String(r[serviceIdx] ?? "").trim(),
    controllerAction: String(r[controllerIdx] ?? "").trim(),
    tenant: String(r[tenantIdx] ?? "").trim(),
    durationNs: toNumber(r[durationIdx]),
    count: toNumber(r[countIdx]),
  }));

  const model = buildModel(records);
  const format = outputPath && outputPath.toLowerCase().endsWith(".md") ? "md" : "wiki";
  const report = format === "md" ? buildMarkdownReport(model) : buildConfluenceWikiReport(model);

  if (outputPath) {
    const outAbs = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(outAbs, report, "utf8");
  } else {
    process.stdout.write(report);
  }
}

main();
