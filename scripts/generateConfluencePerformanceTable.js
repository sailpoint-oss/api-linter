#!/usr/bin/env node
/**
 * Generate Confluence wiki tables from a CSV with columns:
 * SERVICE,#CONTROLLER_AND_ACTION,TENANT,PC99:DURATION,COUNT
 *
 * Output:
 * - Grouped by service (service sections)
 * - Within each service: rows per controller/action sorted by slowest P99 desc (using __TOTAL__ tenant as the overall)
 * - Tenants are grouped into a single column per controller/action, sorted by slowest P99 desc
 *
 * Usage:
 *   node scripts/generateConfluencePerformanceTable.js path/to/file.csv
 *   cat file.csv | node scripts/generateConfluencePerformanceTable.js
 */
import fs from "node:fs";

function stripOuterWrapperQuotes(text) {
  const t = text.trim();
  if (t.startsWith('"') && t.endsWith('"') && t.includes("\n")) {
    return t.slice(1, -1);
  }
  return text;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const cleaned = stripOuterWrapperQuotes(text);
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];

  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line);
    if (fields.length !== header.length) continue;
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = fields[i];
    rows.push(row);
  }

  return rows;
}

function formatCount(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatNs(ns) {
  if (!Number.isFinite(ns)) return "";
  const abs = Math.abs(ns);
  const ms = ns / 1e6;
  if (abs < 1e6) return `${(ns / 1e3).toFixed(2)} µs`;
  if (abs < 1e9) return `${ms.toFixed(ms >= 100 ? 0 : 2)} ms`;
  const s = ns / 1e9;
  if (abs < 60e9) return `${s.toFixed(s >= 10 ? 2 : 3)} s`;
  const m = s / 60;
  if (abs < 3600e9) return `${m.toFixed(m >= 10 ? 1 : 2)} min`;
  const h = m / 60;
  return `${h.toFixed(h >= 10 ? 1 : 2)} h`;
}

function escapeConfluenceCell(text) {
  // Avoid breaking table cells with pipes.
  return String(text ?? "").replaceAll("|", "\\|");
}

function buildModel(rows) {
  /** @type {Map<string, { totals?: any, actions: Map<string, { total?: any, tenants: any[] }> }>} */
  const services = new Map();
  let overallTotal = null;

  for (const r of rows) {
    const service = r["SERVICE"];
    const action = r["#CONTROLLER_AND_ACTION"];
    const tenantRaw = r["TENANT"];
    const tenant = tenantRaw === "" ? "(none)" : tenantRaw;
    const ns = Number(r["PC99:DURATION"]);
    const count = Number(r["COUNT"]);

    const rec = { service, action, tenant, ns, count };

    if (service === "__TOTAL__" && action === "__TOTAL__" && tenantRaw === "__TOTAL__") {
      overallTotal = rec;
      continue;
    }

    if (!services.has(service)) services.set(service, { actions: new Map() });
    const svc = services.get(service);

    if (action === "__TOTAL__" && tenantRaw === "__TOTAL__") {
      svc.totals = rec;
      continue;
    }

    if (!svc.actions.has(action)) svc.actions.set(action, { tenants: [] });
    const a = svc.actions.get(action);

    if (tenantRaw === "__TOTAL__") {
      a.total = rec;
    } else {
      a.tenants.push(rec);
    }
  }

  return { services, overallTotal };
}

function renderServiceTable(serviceName, svc) {
  const actions = Array.from(svc.actions.entries()).map(([actionName, a]) => {
    const totalNs =
      a.total?.ns ??
      (a.tenants.length ? Math.max(...a.tenants.map((t) => t.ns)) : Number.NEGATIVE_INFINITY);
    return { actionName, ...a, totalNs };
  });

  actions.sort((x, y) => y.totalNs - x.totalNs);

  const lines = [];
  lines.push(`h3. ${escapeConfluenceCell(serviceName)}`);
  lines.push(`|| Controller & action || P99 (overall) || Count (overall) || Tenants (P99 desc) ||`);

  if (svc.totals) {
    lines.push(
      `| __TOTAL__ | ${escapeConfluenceCell(formatNs(svc.totals.ns))} | ${escapeConfluenceCell(
        formatCount(svc.totals.count),
      )} | |`,
    );
  }

  for (const a of actions) {
    const tenantsSorted = [...a.tenants].sort((x, y) => y.ns - x.ns);
    const tenantsCell = tenantsSorted
      .map((t) => `${escapeConfluenceCell(t.tenant)} (${escapeConfluenceCell(formatNs(t.ns))}, ${escapeConfluenceCell(formatCount(t.count))})`)
      .join("<br/>");

    lines.push(
      `| ${escapeConfluenceCell(a.actionName)} | ${escapeConfluenceCell(formatNs(a.total?.ns ?? a.totalNs))} | ${escapeConfluenceCell(
        formatCount(a.total?.count ?? 0),
      )} | ${tenantsCell} |`,
    );
  }

  return lines.join("\n");
}

function main() {
  const path = process.argv[2];
  const input = path ? fs.readFileSync(path, "utf8") : fs.readFileSync(0, "utf8");
  const rows = parseCsv(input);
  const { services, overallTotal } = buildModel(rows);

  const svcs = Array.from(services.entries()).map(([name, svc]) => ({
    name,
    svc,
    totalNs: svc.totals?.ns ?? Number.NEGATIVE_INFINITY,
  }));
  svcs.sort((a, b) => b.totalNs - a.totalNs);

  const out = [];
  if (overallTotal) {
    out.push("h2. Overall");
    out.push("|| Scope || P99 || Count ||");
    out.push(`| __TOTAL__ | ${escapeConfluenceCell(formatNs(overallTotal.ns))} | ${escapeConfluenceCell(formatCount(overallTotal.count))} |`);
    out.push("");
  }

  for (const { name, svc } of svcs) {
    out.push(renderServiceTable(name, svc));
    out.push("");
  }

  process.stdout.write(out.join("\n").trimEnd() + "\n");
}

main();
