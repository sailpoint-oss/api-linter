var assert = require("assert");
let wordCount = require("../word-count");
let ruleNumber = 305;

let validSummaryLength = "This is a Summary";
let invalidSummaryLength = "The Summary should be less than 5 words";

let maxWordCountVariableTest =
  "This Summary is checking the variable maxWordCount is working";

describe("Word Length Function", function () {
  it("Should not return any errors for valid word length", function () {
    assert.equal(
      undefined,
      wordCount(validSummaryLength, {
        rule: ruleNumber,
        maxWordCount: 5,
      })
    );
  });

  it("Should return errors for invalid word lengths", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The summary value for a path should not exceed 5 words`,
        },
      ],
      wordCount(invalidSummaryLength, {
        rule: ruleNumber,
        maxWordCount: 5,
      })
    );
  });

  it("Should return no errors for valid word length given maxWordCount is higher than the given string", function () {
    assert.deepEqual(
      undefined,
      wordCount(maxWordCountVariableTest, {
        rule: ruleNumber,
        maxWordCount: 10,
      })
    );
  });

  it("Should return errors for word length given maxWordCount is less than than the given string", function () {
    assert.deepEqual(
      [
        {
          message: `Rule ${ruleNumber}: The summary value for a path should not exceed 7 words`,
        },
      ],
      wordCount(maxWordCountVariableTest, {
        rule: ruleNumber,
        maxWordCount: 7,
      })
    );
  });
});
