# SailPoint API Linter

The SailPoint API Linter extends [spectral](https://meta.stoplight.io/docs/spectral/ZG9jOjYx-overview) an API specification linting tool that uses custom built rulesets to lint API specifications in order to provide feedback on what rules "Must" and "Should" be followed in API specifications. For a list of our API Guidelines refer to: [SailPoint API Guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/#table-of-contents)

## Installation
For installation instructions see the spectral installation document: [How to install spectral](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0Mw-installation)


## Rulesets

We have split up our rules to run on the root level API spec, path operations, and schema objects. We did this in order to provide targeted results to a single file so that our teams could manage the results of the linter instead of receiving an unmanageable set of errors for the entire API spec.

### Root Ruleset

The root ruleset will lint various rules on the root object, for example the info object, tags, paths etc.

An example command to run on the root API specification:

```
spectral lint ~/path-to-spec/api-spec.yaml --ruleset https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/root-ruleset.yaml 
```

### Path Ruleset

The path ruleset will lint specific rules on the operation level [GET, POST, PATCH, PUT] specifications. Some rules include making sure parameters have examples, that integer and double types have a valid format specified, and security is defined on how to access the endpoints.

An example command for running the path ruleset:

```
spectral lint ~/path-to-spec/path.yaml --ruleset https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/path-ruleset.yaml --ignore-unknown-format
```

### Schema Ruleset

The Schema ruleset will lint the schema objects used in the API specification. Examples include checking that each property has an example and description, and that the object has a required key specifying what properties in the schema are required.

An example command for running the schema ruleset:

```
spectral lint ~/path-to-spec/schema.yaml --ruleset https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/schema-ruleset.yaml --ignore-unknown-format
```

## Using the Linter

Typically, contributions to the SailPoint OpenAPI specification involve creating a branch of the API specification in Git and making changes within the branch.  Rather than having to manually run the linter on each file that was changed in the branch, we have provided [lint.sh](./lint.sh), which has two modes. 

The first default mode will automatically run the linter on only the files that have changed in the branch.  To use this script, make sure you are on the correct branch of the API specification repo and run the following command in the root project directory:

```sh
sh /path/to/lint.sh
```

This script uses the git command `git diff --name-only HEAD master` to print the file paths that have changed, and then it loops through each file and applies the appropriate ruleset based on whether the file is a root spec file, path file, or schema file.  This script also has the benefit of referencing the rule files directly from this GitHub repository, so it will always apply the latest rules without the user having to download or synchronize any files.

The second mode is accessed by passing `all` as the first parameter to the script. This will run lint on all yaml files in the path, regardless of if they've changed.

```sh
sh /path/to/lint.sh all
```

## Understanding the Linter Results

The linter will print every problem it finds to stdout.  The following is an example of this output:
![image](https://user-images.githubusercontent.com/75683148/139263011-b9ef3881-6482-4c64-8b29-07a3aafab021.png)
The linter will print the path to the file that it linted, one or more problems, and then a summary of problems.  Each problem line can be broken down as follows:

1. `20:13` indicates the line and character in the file where the problem was found.
2. `error` indicates the severity of the problem found.  `error` translates to a `MUST` in the [API guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/), `warn` translates to `SHOULD`, and `info` translates` to `MAY`.
3. `path-must-define-specific-response-codes` is the name of the rule in the API guidelines that has been violated.
4. `Rule 151:` is the rule number in the API guidelines.  You can use this number to look up more information about that rule in the guidelines.
5. `Operation must have the following ...` is a detailed description of the violation

If the linter reports no problems, then the spec has passed the linter.



