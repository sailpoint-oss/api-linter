const EXAMPLE_PROPERTY = "example";

module.exports = (targetVal, _opts, paths) => {
  if (!Array.isArray(targetVal)) {
    return;
  }

  const results = [];

  const rootPath = paths.target !== void 0 ? paths.target : paths.given;

  for (let i = 0; i < targetVal.length; i++) {

    const tagName = targetVal[i][NAME_PROPERTY];

    

    if (seen.includes(tagName)) {
      results.push({
        message: `Duplicate tag name '${tagName}'`,
        path: [...rootPath, i, NAME_PROPERTY],
      });
    } else {
      seen.push(tagName);
    }
  }
  console.log(results);
  return results;
};