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

  if (targetVal.security != undefined) {
    let oauth2exists = false;

    for (const [key, value] of Object.entries(targetVal.security)) {
        if (value.oauth2 != undefined) {
            oauth2exists = true;
        } 
    }
    if (!oauth2exists) {
        return [{
            message: `Rule ${rule}: Operations must have security.oauth2 with at least one scope defined to access the endpoint`
        }]
    }
  } else if (targetVal.security == null) {
    return [{
        message: `Rule ${rule}: Operations must have security.oauth2 with at least one scope defined to access the endpoint`
    }]
  }
  else {
    console.log(targetVal.security)
    return [
      {
        message: `Rule ${rule}: security key must be defined for operations`,
      }
    ];
  }
};
