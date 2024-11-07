import { expect } from 'chai';
import wordCount from '../word-count.js';

const ruleNumber = 305;

const validSummaryLength = "This is a Summary";
const invalidSummaryLength = "The Summary should be less than 5 words";

const maxWordCountVariableTest =
  "This Summary is checking the variable maxWordCount is working";

describe("Word Length Function", function () {
  it("Should not return any errors for valid word length", function () {
    expect(wordCount(validSummaryLength, {
      rule: ruleNumber,
      maxWordCount: 5,
    })).to.be.undefined;
  });

  it("Should return errors for invalid word lengths", function () {
    expect(wordCount(invalidSummaryLength, {
      rule: ruleNumber,
      maxWordCount: 5,
    })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: The summary value for a path should not exceed 5 words`,
      },
    ]);
  });

  it("Should return no errors for valid word length given maxWordCount is higher than the given string", function () {
    expect(wordCount(maxWordCountVariableTest, {
      rule: ruleNumber,
      maxWordCount: 10,
    })).to.be.undefined;
  });

  it("Should return errors for word length given maxWordCount is less than the given string", function () {
    expect(wordCount(maxWordCountVariableTest, {
      rule: ruleNumber,
      maxWordCount: 7,
    })).to.deep.equal([
      {
        message: `Rule ${ruleNumber}: The summary value for a path should not exceed 7 words`,
      },
    ]);
  });
});
