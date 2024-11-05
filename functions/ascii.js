import pkg from '@stoplight/spectral-core';
const { createRulesetFunction } = pkg;

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
  var ascii = /[^\x00-\x7F]/mg;

  let asciiCharacters = [];

  function eachRecursive(obj) {
    for (var k in obj) {
      if (typeof obj[k] == "object" && obj[k] !== null) {
        eachRecursive(obj[k]);
      } else {
        if (ascii.test(obj[k])) {
          let matches = obj[k].match(/[^\x00-\x7F]/g)
          matches.forEach(element => {
            asciiCharacters.push(element)
          });
        }
      }
    }
  }

  eachRecursive(targetVal);

  if(asciiCharacters.length > 0) {
    return [
      {
        message: `Rule ${rule}: There are non-ascii characters present within the file [${asciiCharacters}]`
      }
    ];
  }
});
