export default (targetVal, options) => {
  const { rule } = options;
  let results = [];
  let operationIdArray = [];

  // If enum is not present, we need to know where to get an ID from for the resource
  if (targetVal["x-sailpoint-resource-operation-id"] === undefined) {
    if (
      targetVal.schema &&
      targetVal.schema.type === "string" &&
      targetVal.schema.enum === undefined
    ) {
      results.push({
        message: `Rule ${rule}: x-sailpoint-resource-operation-id is required for the path parameter: {${targetVal.name}}. Please provide an operation ID for where the resource ID can be found`,
      });
    }
  } else {
    const rawString = process.env.VALID_OPERATION_IDS;
    
    if (rawString) {
      const preloadedOperationIds = rawString.replace(/\[/, '["')
      .replace(/\]/, '"]')
      .replace(/,/g, '","');
      operationIdArray = JSON.parse(preloadedOperationIds);
    } else {
      console.error(
        "Preloaded OperationIds data not found in environment, this will not run the valid operation id check."
      );
    }
        
    if (operationIdArray.length !== 0) {
      if (!operationIdArray.includes(targetVal["x-sailpoint-resource-operation-id"])) {
        results.push({
          message: `Rule ${rule}: ${targetVal["x-sailpoint-resource-operation-id"]} is invalid, the operationId must match an existing operationId in the API specs.`,
        });
      }
    }
  }

  return results;
};
