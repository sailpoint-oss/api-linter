// Example Rule Usage
// path-summary-length:
//  given: $[*].summary
//  severity: error
//  then:
//    function: word-length
//    functionOptions:
//      maxWordCount: 5

module.exports = (targetVal, _opts) => {
    const { maxWordCount } = _opts;
    if (targetVal.split(" ").length > maxWordCount) {
        return [
            {
                message: `The summary value for a path should not exceed 5 words`
            }
        ]
    }
  };