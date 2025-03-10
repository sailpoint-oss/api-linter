import path from "node:path";
import { fileURLToPath } from "node:url";

export const isDev =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export function devLog(data: any) {
  if (isDev) {
    console.log(data);
  }
}

export const ProjectRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
