import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";

type PageFetchResult = {
  id: string;
  title?: string;
  storageValue: string;
};

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function usageAndExit(code: number): never {
  // eslint-disable-next-line no-console
  console.error(
    [
      "Usage:",
      "  node dist/index.js --pageId <id> [--out <file>] [--baseUrl <https://.../wiki>]",
      "",
      "Env:",
      "  CONFLUENCE_EMAIL (required)",
      "  CONFLUENCE_API_TOKEN (required)",
      "  CONFLUENCE_BASE_URL (optional; default https://sailpoint.atlassian.net/wiki)",
    ].join("\n")
  );
  process.exit(code);
}

function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, "");
  // Accept either https://host/wiki or https://host
  if (trimmed.endsWith("/wiki")) return trimmed;
  return `${trimmed}/wiki`;
}

function buildAuthHeader(): string {
  const email = process.env.CONFLUENCE_EMAIL;
  const token = process.env.CONFLUENCE_API_TOKEN;
  if (!email || !token) {
    // Allow callers to pass a fully formed header instead
    const direct = process.env.CONFLUENCE_AUTH_HEADER;
    if (direct) return direct;
    usageAndExit(2);
  }
  const basic = Buffer.from(`${email}:${token}`).toString("base64");
  return `Basic ${basic}`;
}

async function fetchJson(url: string, authHeader: string): Promise<any> {
  const res = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${res.statusText}\n${text}`);
  }
  return await res.json();
}

async function fetchPage(baseUrl: string, pageId: string): Promise<PageFetchResult> {
  const authHeader = buildAuthHeader();

  // Confluence Cloud API v2 (preferred)
  const v2Url = `${baseUrl}/api/v2/pages/${encodeURIComponent(pageId)}?body-format=storage`;
  try {
    const data = await fetchJson(v2Url, authHeader);
    const title = data?.title;
    const storageValue =
      data?.body?.storage?.value ??
      data?.body?.value ??
      data?.storage?.value ??
      data?.value;
    if (typeof storageValue === "string" && storageValue.length > 0) {
      return { id: String(data?.id ?? pageId), title, storageValue };
    }
  } catch {
    // fall back to v1 below
  }

  // Confluence Cloud API v1 (deprecated but still widely enabled)
  const v1Url = `${baseUrl}/rest/api/content/${encodeURIComponent(pageId)}?expand=body.storage,version,space`;
  const data = await fetchJson(v1Url, authHeader);
  const title = data?.title;
  const storageValue = data?.body?.storage?.value;
  if (typeof storageValue !== "string" || storageValue.length === 0) {
    throw new Error("Could not find body.storage.value in Confluence response.");
  }
  return { id: String(data?.id ?? pageId), title, storageValue };
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function transformConfluenceStorageToHtml(storageValue: string): string {
  // Convert a subset of Confluence storage macros into plain HTML that Turndown
  // can reliably convert into Markdown.
  const $ = cheerio.load(storageValue, { xml: { decodeEntities: false } });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isStructuredMacro = (el: any) =>
    el.type === "tag" && (el.tagName === "ac:structured-macro" || el.tagName === "structured-macro");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isParameter = (el: any) =>
    el.type === "tag" && (el.tagName === "ac:parameter" || el.tagName === "parameter");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPlainTextBody = (el: any) =>
    el.type === "tag" && (el.tagName === "ac:plain-text-body" || el.tagName === "plain-text-body");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAttr = (el: any, name: string): string | undefined =>
    // Cheerio keeps namespaced attributes as-is (e.g. "ac:name")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (el.attribs && (el.attribs[name] ?? el.attribs[name.replace("ac:", "")])) as string | undefined;

  $("ac\\:structured-macro, structured-macro").each((_, node) => {
    if (!isStructuredMacro(node)) return;
    const macroName = getAttr(node, "ac:name") ?? getAttr(node, "name");
    if (!macroName) return;

    if (macroName === "code") {
      let language: string | undefined;
      $(node)
        .children()
        .each((__, child) => {
          if (!isParameter(child)) return;
          const paramName = getAttr(child, "ac:name") ?? getAttr(child, "name");
          if (paramName === "language") {
            language = $(child).text().trim() || undefined;
          }
        });

      let code = "";
      $(node)
        .children()
        .each((__, child) => {
          if (isPlainTextBody(child)) {
            code = $(child).text();
          }
        });

      const klass = language ? ` class="language-${escapeHtml(language)}"` : "";
      const replacement = `<pre><code${klass}>${escapeHtml(code)}</code></pre>`;
      $(node).replaceWith(replacement);
      return;
    }

    if (["info", "note", "warning", "tip"].includes(macroName)) {
      const body =
        $(node).find("ac\\:rich-text-body, rich-text-body").first().html() ?? "";
      const label = macroName.toUpperCase();
      $(node).replaceWith(
        `<blockquote><p><strong>${label}:</strong></p>${body}</blockquote>`
      );
      return;
    }
  });

  return $.root().html() ?? storageValue;
}

function htmlToMarkdown(html: string): string {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "_",
  });

  td.use(gfm);

  const isElement = (node: unknown): node is Element =>
    typeof node === "object" &&
    node !== null &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node as any).nodeType === 1;

  // Preserve fenced code blocks with language hints from <code class="language-x">
  td.addRule("fencedCodeWithLanguage", {
    filter: (node) => {
      if (!isElement(node)) return false;
      if (node.nodeName !== "PRE") return false;
      const firstChild = node.firstChild;
      if (!firstChild || !isElement(firstChild)) return false;
      return firstChild.nodeName === "CODE";
    },
    replacement: (_content, node) => {
      if (!isElement(node)) return "";
      const code = node.querySelector("code");
      const klass = code?.getAttribute("class") ?? "";
      const langMatch = klass.match(/language-([A-Za-z0-9_-]+)/);
      const lang = langMatch?.[1] ?? "";
      const text = code?.textContent ?? "";
      const fence = "```";
      return `\n\n${fence}${lang}\n${text.replace(/\n$/, "")}\n${fence}\n\n`;
    },
  });

  // Turndown sometimes escapes too aggressively in Confluence bodies; keep raw HTML
  // for elements it can't convert.
  td.keep(["iframe"]);

  const dom = new JSDOM(html);
  return (
    td.turndown(dom.window.document.body).replace(/\n{3,}/g, "\n\n").trim() + "\n"
  );
}

async function main(): Promise<void> {
  const pageId = getArgValue("--pageId") ?? getArgValue("-p");
  if (!pageId) usageAndExit(2);

  const baseUrlRaw =
    getArgValue("--baseUrl") ??
    process.env.CONFLUENCE_BASE_URL ??
    "https://sailpoint.atlassian.net/wiki";
  const baseUrl = normalizeBaseUrl(baseUrlRaw);

  const outPath =
    getArgValue("--out") ??
    path.resolve(process.cwd(), `confluence-page-${pageId}.md`);

  const page = await fetchPage(baseUrl, pageId);
  const html = transformConfluenceStorageToHtml(page.storageValue);
  const mdBody = htmlToMarkdown(html);

  const titleLine = page.title ? `# ${page.title}\n\n` : "";
  const md = `${titleLine}${mdBody}`;

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, md, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

