import wordCount from '../word-count.js';

const ruleNumber = 305;

const validSummaryLength = "This is a Summary";
const invalidSummaryLength = "The Summary should be less than 5 words";

const maxWordCountVariableTest =
  "This Summary is checking the variable maxWordCount is working";

describe("Word Length Function", () => {
  test("Should not return any errors for valid word length", () => {
    expect(wordCount(validSummaryLength, { rule: ruleNumber, maxWordCount: 5 }))
      .toBeUndefined();
  });

  test("Should return errors for invalid word lengths", () => {
    expect(wordCount(invalidSummaryLength, { rule: ruleNumber, maxWordCount: 5 }))
      .toEqual([
        {
          message: `Rule ${ruleNumber}: The summary value for a path should not exceed 5 words`,
        },
      ]);
  });

  test("Should return no errors for valid word length when maxWordCount is higher", () => {
    expect(wordCount(maxWordCountVariableTest, { rule: ruleNumber, maxWordCount: 10 }))
      .toBeUndefined();
  });

  test("Should return errors for word length when maxWordCount is less than given string", () => {
    expect(wordCount(maxWordCountVariableTest, { rule: ruleNumber, maxWordCount: 7 }))
      .toEqual([
        {
          message: `Rule ${ruleNumber}: The summary value for a path should not exceed 7 words`,
        },
      ]);
  });
});
