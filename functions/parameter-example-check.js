export default (targetVal, options) => {
  const { rule } = options;
  if (
    (targetVal.example != undefined && targetVal.example != null) ||
    (targetVal.schema != undefined &&
      targetVal.schema.example != undefined &&
      targetVal.schema.example != null) ||
    (targetVal.examples != undefined && targetVal.examples != null)
  ) {
  } else {
    return [
      {
        message: `Rule ${rule}: An example for ${targetVal.name} must be provided under one of the following keys: example, schema.example, examples`,
      },
    ];
  }
};
