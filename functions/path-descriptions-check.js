// path-description-html-chars:
// message: "{{error}}"
// given: $[*].description
// severity: error
// then:
//   function: path-descriptions-check
//   functionOptions:
//     rule: 405

module.exports = (targetVal, _opts) => {
    const { rule } = _opts;

    let regex = new RegExp("<.*?>");
    if (regex.test(targetVal)) {
      // Contains HTML Tags
    return [
        {
            message: `Rule ${rule}: Descriptions should not contain HTML, please use markdown instead.`
        }
    ]
    }
  };