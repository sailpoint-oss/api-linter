export default (targetVal: any, options: any) => {
  const { rule } = options;

  // ASCII Character Regex
  const ascii = /[^\x00-\x7F]/mg;
<<<<<<<< HEAD:packages/sailpoint-rulesets/functions/ascii.js

  // Array of ASCII Characters
  let asciiCharacters = [];
========
>>>>>>>> 56af2cc (Refactor with pnpm workspaces, TS, and adjusted formatting and promise structure):packages/sailpoint-rulesets/functions/ascii.ts

  // Array of ASCII Characters
  let asciiCharacters: string[] = [];

  function eachRecursive(obj: any ) {
    for (var k in obj) {
      if (typeof obj[k] == "object" && obj[k] !== null) {
        eachRecursive(obj[k]);
      } else {
        if (ascii.test(obj[k])) {
          let matches = obj[k].match(/[^\x00-\x7F]/g)
<<<<<<<< HEAD:packages/sailpoint-rulesets/functions/ascii.js
          matches.forEach((element) => {
========
          matches.forEach((element: string) => {
>>>>>>>> 56af2cc (Refactor with pnpm workspaces, TS, and adjusted formatting and promise structure):packages/sailpoint-rulesets/functions/ascii.ts
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
};
