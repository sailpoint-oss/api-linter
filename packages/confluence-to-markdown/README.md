# Confluence to Markdown

This package fetches a Confluence Cloud page by page id and converts the **storage** body (XHTML) into Markdown.

## Usage

Set environment variables:

- `CONFLUENCE_BASE_URL` (optional): defaults to `https://sailpoint.atlassian.net/wiki`
- `CONFLUENCE_EMAIL` (required): your Atlassian account email
- `CONFLUENCE_API_TOKEN` (required): an Atlassian API token

Run:

```bash
pnpm -C packages/confluence-to-markdown install
pnpm -C packages/confluence-to-markdown build

CONFLUENCE_EMAIL="you@example.com" \
CONFLUENCE_API_TOKEN="***" \
CONFLUENCE_BASE_URL="https://sailpoint.atlassian.net/wiki" \
node packages/confluence-to-markdown/dist/index.js --pageId 4505272355 --out /workspace/confluence-page-4505272355.md
```

## Notes

- This uses Confluence Cloud API (tries v2 first, then falls back to v1).
- Confluence macros (notably the `code` macro) are converted into Markdown fences where possible.

