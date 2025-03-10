export default (targetVal, options, context) => {
  const { rule } = options;
  let results = [];

  if (context == undefined) {
    console.log("NO CONTEXT, SKIPPING RULE 405");
  } else {
    const apiVersionsToValidate = ["v2024", "v2025"];
    const documentData = context.document.parserResult.data;
    const validReferences = Object.keys(
      context.documentInventory.referencedDocuments
    );
    const matchingReferences = extractValidReferencedPaths(
      documentData,
      validReferences,
      context.document.source
    );

    const sourceVersionFolder = getVersionFolder(context.document.source);

    for (const reference of matchingReferences) {
      const refVersionFolder = getVersionFolder(reference.ref);
      if (
        apiVersionsToValidate.includes(
          getRelativePathFromVersion(sourceVersionFolder)
        ) &&
        refVersionFolder !== sourceVersionFolder
      ) {
        results.push({
          message: `Rule ${rule}: Referenced document ${getRelativePathFromVersion(
            reference.ref
          )} is outside the allowed version folder ${getRelativePathFromVersion(
            sourceVersionFolder
          )}`,
          path: [...toNumbers(removeLastTwo(reference.path).split("."))],
        });
      }
    }
  }

  return results;
};

const toNumbers = arr => arr.map(function(item) {
  if(isNaN(parseInt(item, 10))) {
      return item
  } else {
      return parseInt(item, 10);  
  }
});

function removeLastTwo(path) {
  const parts = path.split(".");
  if (parts.length > 1) {
    parts.pop(); // Remove last item
    parts.pop(); // Remove second last item
  }
  return parts.join(".");
}

function getVersionFolder(filePath) {
  const parts = filePath.split("/");
  const versionIndex = parts.findIndex((part) =>
    ["v3", "beta", "v2024"].includes(part)
  );
  if (versionIndex === -1) {
    throw new Error(`Unable to determine version folder for path: ${filePath}`);
  }
  return parts.slice(0, versionIndex + 1).join("/");
}

function getRelativePathFromVersion(filePath) {
  const parts = filePath.split("/");
  const versionIndex = parts.findIndex((part) =>
    ["v3", "beta", "v2024"].includes(part)
  );
  if (versionIndex === -1) {
    throw new Error(`Unable to determine version folder for path: ${filePath}`);
  }
  return parts.slice(versionIndex).join("/");
}

function extractValidReferencedPaths(
  documentData,
  validReferences,
  sourcePath
) {
  function findReferences(obj, path = "") {
    let references = [];
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
