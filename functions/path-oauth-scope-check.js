// path-description-html-chars:
// message: "{{error}}"
// given: $[*].description
// severity: error
// then:
//   function: path-descriptions-check
//   functionOptions:
//     rule: 405

import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction(
  {
    input: null,
    options: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: true,
      },
      required: ["rule"],
    },
  },
  (targetVal, options) => {
  const { rule } = options;

  let results = [];
  if (targetVal.security != undefined) {
    if (targetVal.security.length === 0) {
      results.push({
        message: `Rule ${rule}: Operations must define the security array with one or more of the following values: userAuth, applicationAuth, or {} (empty object means no auth required).`,
      });
      return results;
    }
    let invalidKeys = [];
    const validKeys = ["userAuth", "applicationAuth"];

    targetVal.security.forEach((item) => {
      const keys = Object.keys(item);
      invalidKeys = keys.filter((key) => !validKeys.includes(key));
    });

    if (invalidKeys.length > 0) {
      results.push({
        message: `Rule ${rule}: Operations must have security.userAuth and/or security.applicationAuth defined with at least one scope to access the endpoint. ${invalidKeys} is not a valid key`,
      });
      return results;
    } else {
      const uniqueScopes = new Set();

      // Iterate over each object in the array
      targetVal.security.forEach((item) => {
        if (item.userAuth !== undefined && !Array.isArray(item.userAuth)) {
          results.push({
            message: `Rule ${rule}: userAuth must be an array of one or more scopes`,
          });
        }

        if (
          item.applicationAuth !== undefined &&
          !Array.isArray(item.applicationAuth)
        ) {
          results.push({
            message: `Rule ${rule}: applicationAuth must be an array of one or more scopes`,
          });
        }

        if (item.userAuth != undefined && Array.isArray(item.userAuth)) {
          if (item.userAuth) {
            item.userAuth.forEach((auth) => uniqueScopes.add(auth));
          }
        }

        if (
          item.applicationAuth != undefined &&
          Array.isArray(item.applicationAuth)
        ) {
          if (item.applicationAuth) {
            item.applicationAuth.forEach((auth) => uniqueScopes.add(auth));
          }
        }
      });

      uniqueScopes.forEach((scope) => {
        let pattern = /^[a-z]+:[a-z-]+:[a-z]+$/;
        if (!pattern.test(scope)) {
          results.push({
            message: `Rule ${rule}: oauth2 scope "${scope}" does not match the valid pattern for scopes. A valid example would be idn:access-profile:read`,
          });
        }
      });

      return results;
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
});
