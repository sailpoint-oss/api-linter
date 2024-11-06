// paths-should-not-have-more-than-three-sub-resources:
// description: ${{error}}
// given: $.paths.*~
// severity: warn
// then:
//   function: path-validator


export default (targetVal, options) => {
  const { rule } = options;
  let path = targetVal.substring(1).split("/");

  let count = 0;
  path.forEach((element) => {
    if (element.indexOf("{") == -1) {
      count += 1;
    }
  });

  if (count > 3) {
    return [
      {
        message: `Rule ${rule}: The path must not exceed 3 sub-resources`,
      },
    ];
  }
};
