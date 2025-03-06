export default (targetVal, options) => {
  const { rule} = options;

  let results = [];
  let operationIdArray = [];

  if (targetVal.parameters === undefined) {
    return results;
  }
  
  const operationId = targetVal.operationId;
  const pathParameters = targetVal.parameters
  .filter(param => param.in === 'path');


  pathParameters.forEach(pathParameter => {

    if(operationId != undefined && pathParameter["x-sailpoint-resource-operation-id"] != undefined) {
      if (operationId === pathParameter["x-sailpoint-resource-operation-id"]) {
        results.push({
          message: `Rule ${rule}: ${pathParameter["x-sailpoint-resource-operation-id"]} is invalid. The x-sailpoint-resource-operation-id cannot reference itself, please provide an operation Id for where ${pathParameter.name} can be found in the response.`,
        });
        return results;
      }
    }

  // If enum is not present, we need to know where to get an ID from for the resource
    if (pathParameter["x-sailpoint-resource-operation-id"] === undefined) {
      if (
        pathParameter.schema &&
        pathParameter.schema.type === "string" &&
        pathParameter.schema.enum === undefined
      ) {
        results.push({
          message: `Rule ${rule}: x-sailpoint-resource-operation-id is required for the path parameter: {${pathParameter.name}}. Please provide an operation ID for where the resource ID can be found. For example, if the path parameter is an accountId, the x-sailpoint-resource-operation-id should be listAccounts.`,
        });
      }
    } else {
      const rawString = process.env.VALID_OPERATION_IDS;
      
      if (rawString) {
        operationIdArray = JSON.parse(rawString);
      } else {
        console.error(
          "Preloaded OperationIds data not found in environment, this will not run the valid operation id check."
        );
      }

      if (operationIdArray.length !== 0) {
        if (pathParameter["x-sailpoint-resource-operation-id"] instanceof Array) {
          for (let i = 0; i < pathParameter["x-sailpoint-resource-operation-id"].length; i++) {
            if (!operationIdArray.includes(pathParameter["x-sailpoint-resource-operation-id"][i])) {
              results.push({
                message: `Rule ${rule}: ${pathParameter["x-sailpoint-resource-operation-id"][i]} is invalid, the operationId must match an existing operationId in the API specs.`,
              });
            }
          }
        } else if (!operationIdArray.includes(pathParameter["x-sailpoint-resource-operation-id"])) {
          results.push({
            message: `Rule ${rule}: ${pathParameter["x-sailpoint-resource-operation-id"]} is invalid, the operationId must match an existing operationId in the API specs.`,
          });
        }
      }
    }
  });

  return results;
};
