// paths-should-not-have-more-than-three-sub-resources:
// description: ${{error}}
// given: $.paths.*~
// severity: warn
// then:
//   function: path-validator

module.exports = (targetVal, _opts) => {
  path = targetVal.substring(1).split("/");

  count = 0;
  path.forEach((element) => {
    if (element.indexOf("{") == -1) {
      count += 1;
    }
  });

  if (count > 3) {
    return [
        {
            message: `The path must not exceed 3 sub-resources`
        }
    ]
}
};
