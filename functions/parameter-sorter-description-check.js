import { createRulesetFunction } from '@stoplight/spectral-core';


export default createRulesetFunction(
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
  (targetVal, options) => {
  const { rule } = options;

  const oneNewLine = new RegExp('([^\n]\n[^\n])+')
  if (oneNewLine.test(targetVal)) {
    return [
      {
        message: `Rule ${rule}: Each line in the description for sorters must always be separated by two lines.`,
      },
    ];
  }

  let parts = targetVal.split('\n\n')

  if (parts[0] !== "Sort results using the standard syntax described in [V3 API Standard Collection Parameters](https://developer.sailpoint.com/idn/api/standard-collection-parameters#sorting-results)") {
    return [
      {
        message: `Rule ${rule}: The first line in the description for sorters must follow the example provided in the guide for rule ${rule}.`,
      },
    ];
  }

  if (!parts[1].includes('Sorting is supported for the following fields:')) {
    return [
      {
        message: `Rule ${rule}: Must use the following format when describing sortable fields: "Sorting is supported for the following fields: **name, created, etc**".`,
      },
    ];
  }

  const properties = parts[1].split(':')[1].trim().replace('.', '')

  // Check that the properties are bolded
  let regex = new RegExp('^\\*\\*[a-z].*[a-z]\\*\\*$')
  if (!regex.test(properties)) {
    return [
      {
        message: `Rule ${rule}: The sortable fields list must be bolded (ex. **name, created, modified**).`,
      },
    ];
  }

  // Check if the properties contain dashes
  if (properties.includes('-')) {
    return [
      {
        message: `Rule ${rule}: Dashes are not allowed when listing supported fields.  Fields must support both ascending and descending.`,
      },
    ];
  }

  // Check if the properties are comma separated
  regex = new RegExp('^\\*\\*[a-zA-Z.]+(,\\s[a-zA-Z.]+)*\\*\\*$')
  if (!regex.test(properties)) {
    return [
      {
        message: `Rule ${rule}: The sortable fields must be separated with commas and spaces (ex. **name, created, modified**).`,
      },
    ];
  }
});
