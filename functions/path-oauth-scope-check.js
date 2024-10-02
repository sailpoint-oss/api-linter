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
    let oauth2key = ""
    for (const [key, value] of Object.entries(targetVal.security)) {
      if (value.userAuth != undefined) {
        oauth2exists = true;
        oauth2key = "userAuth"
      }
      if (value.applicationAuth != undefined) {
        oauth2exists = true;
        oauth2key = "applicationAuth"
      }
    }
    if (!oauth2exists) {
      return [
        {
          message: `Rule ${rule}: Operations must have security.userAuth and/or security.applicationAuth defined with at least one scope to access the endpoint`,
        },
      ];
    } else {
      for (const [key, value] of Object.entries(targetVal.security)) {
        if (typeof(value[oauth2key]) !== "object") {
          return [
            {
              message: `Rule ${rule}: Operations must have security.userAuth and/or security.applicationAuth defined as an object with at least one scope defined to access the endpoint`,
            },
          ]
        } else {
          for (const [oauthKey, oauthValue] of Object.entries(value[oauth2key])) {
            let pattern = /^[a-z]+:[a-z-]+:[a-z]+$/;
            if(!pattern.test(oauthValue)) {
              return [
                {
                  message: `Rule ${rule}: oauth2 scope "${oauthValue}" does not match the valid pattern for scopes. A valid example would be idn:access-profile:read`,
                },
              ]
            }
          }
        }
      }
    }
  } else if (targetVal.security == null) {
    return [
      {
        message: `Rule ${rule}: Operations must have at least one scope defined to access the endpoint`,
      },
    ];
  } else {
    return [
      {
        message: `Rule ${rule}: security key must be defined for operations`,
      },
    ];
  }
};
