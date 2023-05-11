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
      return [
        {
          message: `Rule ${rule}: Operations must have security.oauth2 with at least one scope defined to access the endpoint`,
        },
      ];
    } else {
      for (const [key, value] of Object.entries(targetVal.security)) {
        if (typeof(value.oauth2) !== "object") {
          return [
            {
              message: `Rule ${rule}: Operations must have security.oauth2 defined as an object with at least one scope defined to access the endpoint`,
            },
          ]
        } else {
          for (const [oauthKey, oauthValue] of Object.entries(value.oauth2)) {
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
        message: `Rule ${rule}: Operations must have security.oauth2 with at least one scope defined to access the endpoint`,
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
