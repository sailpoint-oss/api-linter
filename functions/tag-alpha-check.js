module.exports = (targetVal, _opts) => {
  const { rule } = _opts;

  let results = [];

  if (!isAlphabeticalOrder(targetVal)) {
    results.push({
      message: `Rule ${rule}: Tags must be in alphabetical order`,
      path: ["tags"],
    });
  }

  return results;
};

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
