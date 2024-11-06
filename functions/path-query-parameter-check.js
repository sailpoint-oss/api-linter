import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
        field: true
      },
      required: ["rule", "field"],
    },
  },
  (targetVal, options) => {
    const { rule, field } = options;

    if (targetVal.parameters == undefined || targetVal.parameters == null) {
        return [
            {
                message: `Rule ${rule}: All GET operations should have ${field} as a query parameter`
            }
        ]; 
    }


    let keyFound = false;
    for (const [key, value] of Object.entries(targetVal.parameters)) {
         if (JSON.stringify(value).indexOf(`"in":"query","name":"${field}"`) == 1) {
            keyFound = true
        }
    }

    if (!keyFound) {
        return [
            {
                message: `Rule ${rule}: All GET operations should have ${field} as a query parameter`
            }
        ];
      }


})