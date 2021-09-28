// path-must-define-specific-response-codes:
// description: Operation must define at least one 200 level code and the following error codes [400, 401, 403, 429, 500]
// given: $.[*].responses
// severity: error
// then:
//   function: response-validator

// Function to remove single error codes from a set array as we find them in the yaml document
function removeErrorCode(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

module.exports = (targetVal, _opts) => {
  const { rule } = _opts;
  error_response_codes = ["400", "401", "403", "429", "500"]; // Error Codes to check
  contains_2xx_code = false;

  // Loop through each key in the reponses objects 
  for (const [key, value] of Object.entries(targetVal)) {

    if (key.substring(0,1).includes("2")) {
      contains_2xx_code = true;
    }

    if (key.includes("400")) {
      removeErrorCode(error_response_codes, "400");
    }

    if (key.includes("401")) {
      removeErrorCode(error_response_codes, "401");
    }

    if (key.includes("403")) {
      removeErrorCode(error_response_codes, "403");
    }

    if (key.includes("429")) {
      removeErrorCode(error_response_codes, "429");
    }

    if (key.includes("500")) {
      removeErrorCode(error_response_codes, "500");
    }
  }

  // If the responses have a 2xx level response, but one or more error codes need to be defined
  if (contains_2xx_code == true && error_response_codes.length >= 1) {
    return [
      {
        message: `Rule ${rule}: Operation must have the following error codes defined: ${error_response_codes}`
      }
    ];
    // If the responses are missing a 2xx level response and one or more error codes need to be defined
  } else if (contains_2xx_code == false && error_response_codes.length >= 1) {
    return [
      {
        message: `Rule ${rule}: Operation must have at least one 200 level response code defined and the following error codes defined: ${error_response_codes}`
      }
    ];  
    // If the responses are missing a 2xx level response, but all required error code responses are defined
  } else if (contains_2xx_code == false && error_response_codes.length == 0) {
    return [
      {
        message: `Rule ${rule}: Operation must have at least one 200 level response code defined`
      }
    ];
  }
};
