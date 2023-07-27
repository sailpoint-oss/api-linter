module.exports = (targetVal, _opts) => {
  const reservedKeywords = [
    "type",
    "format",
    "description",
    "items",
    "properties",
    "additionalProperties",
    "default",
    "allOf",
    "oneOf",
    "anyOf",
    "not",
  ];

  const { rule } = _opts;

  console.log(targetVal.name);

  if (
    targetVal.name != undefined &&
    reservedKeywords.includes(targetVal.name)
  ) {
    return [
      {
        message: `Rule ${rule}: The property ${targetVal.name} is a reserved keyword of OpenAPI Specifications. Please use a different name`,
      },
    ];
  }
};
