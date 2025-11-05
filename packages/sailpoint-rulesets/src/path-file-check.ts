import { RulesetFunctionContext } from "@stoplight/spectral-core";
import { OpenAPIV3 } from "openapi-types";
import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";

// Create the original function using Spectral's helper.
export default createOptionalContextRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
      },
      required: ["rule"],
    },
  },
  (
    targetVal: OpenAPIV3.OperationObject,
    options: { rule: string },
    context: RulesetFunctionContext,
  ) => {
    const { rule } = options;
    let results = [];

    if (!context || !context.document || !context.document.source) {
      console.log("NO CONTEXT, SKIPPING RULE 405");
    } else {
      const apiVersionsToValidate = ["v2024", "v2025", "v2026"];
      // @ts-expect-error parserResult is valid, but not typed
      const documentData = context.document.parserResult.data;
      const validReferences = Object.keys(
        context.documentInventory.referencedDocuments,
      );
      const matchingReferences = extractValidReferencedPaths(
        documentData,
        validReferences,
        context.document.source,
      );

      const sourceVersionFolder = getVersionFolder(context.document.source);

      if (!sourceVersionFolder) {
        console.log(`Skipping validation: Unable to determine version folder for ${context.document.source}`);
        return [];
      }
      
      for (const reference of matchingReferences) {
        const refVersionFolder = getVersionFolder(reference.ref);
        if (!refVersionFolder) {
          console.log(`Skipping reference ${reference.ref}: Unable to determine version folder`);
          continue;
        }
      
        const sourceRelative = getRelativePathFromVersion(sourceVersionFolder);
        const refRelative = getRelativePathFromVersion(reference.ref);
      
        if (!sourceRelative || !refRelative) {
          console.log(`Skipping validation due to missing relative paths for ${reference.ref}`);
          continue;
        }
      
        if (apiVersionsToValidate.includes(sourceRelative) && refVersionFolder !== sourceVersionFolder) {
          results.push({
            message: `Rule ${rule}: Referenced document ${refRelative} is outside the allowed version folder ${sourceRelative}`,
            path: [...toNumbers(removeLastTwo(reference.path).split("."))],
          });
        }
      }
    }

    return results;
  },
);

const toNumbers = (arr: string[]) =>
  arr.map((item) => {
    if (isNaN(parseInt(item, 10))) {
      return item;
    } else {
      return parseInt(item, 10);
    }
  });

function removeLastTwo(path: string) {
  const parts = path.split(".");
  if (parts.length > 1) {
    parts.pop(); // Remove last item
    parts.pop(); // Remove second last item
  }
  return parts.join(".");
}

function getVersionFolder(filePath: string) {
  const parts = filePath.split("/");
  const versionIndex = parts.findIndex((part) =>
    ["v3", "beta", "v2024", "v2025", "v2026"].includes(part),
  );
  return versionIndex !== -1 ? parts.slice(0, versionIndex + 1).join("/") : null;
}

function getRelativePathFromVersion(filePath: string) {
  const parts = filePath.split("/");
  const versionIndex = parts.findIndex((part) =>
    ["v3", "beta", "v2024", "v2025", "v2026"].includes(part),
  );
  return versionIndex !== -1 ? parts.slice(versionIndex).join("/") : null;
}

function extractValidReferencedPaths(
  documentData: any,
  validReferences: string[],
  sourcePath: string,
) {
  function findReferences(
    obj: any,
    path = "",
  ): { path: string; ref: string }[] {
    let references: { path: string; ref: string }[] = [];
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        const newPath = path ? `${path}.${key}` : key;
        if (key === "$ref" && typeof obj[key] === "string") {
          const fullPath = new URL(obj[key], `file://${sourcePath}`).pathname;
          references.push({ path: newPath, ref: fullPath });
        } else {
          references = references.concat(findReferences(obj[key], newPath));
        }
      }
    }

    return references;
  }

  const allReferences = findReferences(documentData);
  return allReferences.filter((refObj) => validReferences.includes(refObj.ref));
}
