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
    
    if (!isAlphabeticalOrder(targetVal)) {
        return [
            {
                message: `Rule ${rule}: Tags must be in alphabetical order`,
                path: ["tags"],
              }
        ]
    } else {
        console.log("Tags are in alphabetical order");
    }
  },
);

function isAlphabeticalOrder(arr) {
    // Extract the names from the array of objects
    const names = arr.map((obj) => obj.name);
  
    // Check if each name is less than or equal to the next name in the array
    for (let i = 0; i < names.length - 1; i++) {
      if (names[i].localeCompare(names[i + 1]) > 0) {
        console.log(names[i] + " is greater than " + names[i + 1]);
        return false; // If any name is greater than the next, return false
      }
    }
  
    return true; // If no names are out of order, return true
  }