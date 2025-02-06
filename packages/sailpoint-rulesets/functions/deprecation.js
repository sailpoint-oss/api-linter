export default (targetVal, options, { path }) => {
<<<<<<< HEAD
  const { rule } = options;
  let results = [];
  let deprecatedKeyFound = false;
  let sunsetKeyFound = false;

  const rootPath = path;

  if (targetVal.deprecated != undefined && targetVal.deprecated == true) {
    if (targetVal.parameters != undefined && targetVal.parameters != null) {
      deprecatedKeyFound = false;
      sunsetKeyFound = false;
      for (const [key, value] of Object.entries(targetVal.parameters)) {
        if (JSON.stringify(value).indexOf('"in":"header","name":"deprecation"') == 1) {
            deprecatedKeyFound = true
        } else if (JSON.stringify(value).indexOf('"in":"header","name":"sunset"') == 1) {
            sunsetKeyFound = true
        }
      }

      if (!deprecatedKeyFound && !sunsetKeyFound) {
        results.push({
            message: `Rule ${rule}: The ${rootPath} operation should define deprecation and sunset dates in the header if api is marked as deprecated`,
            //path: [...rootPath, "deprecated"],
          });
      } else if (!sunsetKeyFound) {
        results.push({
            message: `Rule ${rule}: The ${rootPath} operation should define sunset date in the header if api is marked as deprecated`,
            //path: [...rootPath, "deprecated"],
          });
      } else if (!deprecatedKeyFound) {
        results.push({
            message: `Rule ${rule}: The ${rootPath} operation should define deprecation date in the header if api is marked as deprecated`,
            //path: [...rootPath, "deprecated"],
          });
      }
    } else {
      results.push({
        message: `Rule ${rule}: The ${rootPath} operation should define deprecation and sunset dates in the header if api is marked as deprecated`,
        //path: [...rootPath, "deprecated"],
      });
    }
  }
  
  return results;
};
=======
    const { rule } = options;
    let results = [];
    let deprecatedKeyFound = false;
    let sunsetKeyFound = false;
    const rootPath = path;
    if (targetVal.deprecated != undefined && targetVal.deprecated == true) {
        if (targetVal.parameters != undefined && targetVal.parameters != null) {
            deprecatedKeyFound = false;
            sunsetKeyFound = false;
            for (const [key, value] of Object.entries(targetVal.parameters)) {
                if (JSON.stringify(value).indexOf('"in":"header","name":"deprecation"') == 1) {
                    deprecatedKeyFound = true;
                }
                else if (JSON.stringify(value).indexOf('"in":"header","name":"sunset"') == 1) {
                    sunsetKeyFound = true;
                }
            }
            if (!deprecatedKeyFound && !sunsetKeyFound) {
                results.push({
                    message: `Rule ${rule}: The ${rootPath} operation should define deprecation and sunset dates in the header if api is marked as deprecated`,
                    //path: [...rootPath, "deprecated"],
                });
            }
            else if (!sunsetKeyFound) {
                results.push({
                    message: `Rule ${rule}: The ${rootPath} operation should define sunset date in the header if api is marked as deprecated`,
                    //path: [...rootPath, "deprecated"],
                });
            }
            else if (!deprecatedKeyFound) {
                results.push({
                    message: `Rule ${rule}: The ${rootPath} operation should define deprecation date in the header if api is marked as deprecated`,
                    //path: [...rootPath, "deprecated"],
                });
            }
        }
        else {
            results.push({
                message: `Rule ${rule}: The ${rootPath} operation should define deprecation and sunset dates in the header if api is marked as deprecated`,
                //path: [...rootPath, "deprecated"],
            });
        }
    }
    return results;
};
//# sourceMappingURL=deprecation.js.map
>>>>>>> 56af2cc (Refactor with pnpm workspaces, TS, and adjusted formatting and promise structure)
