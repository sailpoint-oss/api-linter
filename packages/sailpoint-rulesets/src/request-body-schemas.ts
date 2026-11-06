// Finds out if a schema file is part of a request body.
//
// A schema file does not know where it is used. This module reads the path
// files of every collection next to the schema's collection, for example
// apis/*/paths/ for apis/<name>/schemas/x.yaml. It collects each schema file
// that a request body references, and then follows the $ref links in those
// files, because a schema that a request body schema references is also
// part of the request body.

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

// PUT is not in the list. In a PUT, a missing field keeps the stored value, so
// a default has no meaning there (rule 316). A schema that a PUT and a POST
// both use is still a request body schema, because of the POST.
const METHODS = ["get", "post", "patch", "delete", "head", "options"];

// One set of request body schema files for each folder of collections.
const cache = new Map<string, Set<string>>();

function findPathsDir(source: string): string | undefined {
  let dir = path.dirname(source);
  for (let i = 0; i < 4; i++) {
    const candidate = path.join(dir, "paths");
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
    dir = path.dirname(dir);
  }
  return undefined;
}

function loadYaml(file: string): unknown {
  try {
    return yaml.load(fs.readFileSync(file, "utf8"));
  } catch {
    // A file that does not exist or does not parse is reported by other rules.
    return undefined;
  }
}

// Collects the files that the external $ref links in a value point to.
function collectRefs(value: unknown, fromFile: string, refs: string[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRefs(item, fromFile, refs));
    return;
  }
  if (value === null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    // Example data is not a schema, so a $ref key in it is not a link.
    if (key === "example" || key === "examples" || key === "default") continue;
    if (key === "$ref" && typeof child === "string" && !child.startsWith("#")) {
      refs.push(path.resolve(path.dirname(fromFile), child.split("#")[0]));
    } else {
      collectRefs(child, fromFile, refs);
    }
  }
}

function listPathFiles(collectionsDir: string): string[] {
  const files: string[] = [];
  for (const collection of fs.readdirSync(collectionsDir)) {
    const pathsDir = path.join(collectionsDir, collection, "paths");
    if (!fs.existsSync(pathsDir) || !fs.statSync(pathsDir).isDirectory()) continue;
    for (const file of fs.readdirSync(pathsDir, { recursive: true }) as string[]) {
      if (/\.ya?ml$/.test(file)) files.push(path.join(pathsDir, file));
    }
  }
  return files;
}

function requestBodySchemas(collectionsDir: string): Set<string> {
  const cached = cache.get(collectionsDir);
  if (cached) return cached;

  // The schema files that a request body references directly.
  const queue: string[] = [];
  for (const file of listPathFiles(collectionsDir)) {
    const doc = loadYaml(file) as Record<string, any> | undefined;
    if (!doc || typeof doc !== "object") continue;
    for (const method of METHODS) {
      const requestBody = doc[method]?.requestBody;
      if (requestBody) collectRefs(requestBody, file, queue);
    }
  }

  // Follow the $ref links of those files.
  const schemas = new Set<string>();
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (schemas.has(file)) continue;
    schemas.add(file);
    collectRefs(loadYaml(file), file, queue);
  }

  cache.set(collectionsDir, schemas);
  return schemas;
}

export function isRequestBodySchema(source: string | null | undefined): boolean {
  if (!source || !path.isAbsolute(source)) return false;
  const pathsDir = findPathsDir(source);
  if (!pathsDir) return false;
  // The paths folder is <collections>/<collection>/paths.
  const collectionsDir = path.dirname(path.dirname(pathsDir));
  return requestBodySchemas(collectionsDir).has(path.resolve(source));
}
