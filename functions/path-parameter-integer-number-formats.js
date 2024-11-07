export default (targetVal, options) => {
  const { rule } = options;
  if (
    targetVal.schema != undefined &&
    targetVal.schema.type != undefined &&
    targetVal.schema.type != null
  ) {
    if (targetVal.schema.type == "integer") {
      if (targetVal.schema.format == undefined) {
        return [
          {
            message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: int32, int64, bigint`,
          },
        ];
      } else if (
        !["int32", "int64", "bigint"].includes(targetVal.schema.format)
      ) {
        return [
          {
            message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: int32, int64, bigint`,
          },
        ];
      }
    } else if (targetVal.schema.type == "number") {
      if (targetVal.schema.format == undefined) {
        return [
          {
            message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: float, double, decimal`,
          },
        ];
      } else if (
        !["float", "double", "decimal"].includes(targetVal.schema.format)
      ) {
        return [
          {
            message: `Rule ${rule}: ${targetVal.name} is type ${targetVal.schema.type} and must be one of the following values: float, double, decimal`,
          },
        ];
      }
    }
  }
};
