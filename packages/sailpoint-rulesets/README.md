# SailPoint API Linter

The SailPoint API Linter extends [spectral](https://meta.stoplight.io/docs/spectral/ZG9jOjYx-overview) an API specification linting tool that uses custom built rulesets to lint API specifications in order to provide feedback on what rules "Must" and "Should" be followed in API specifications. For a list of our API Guidelines refer to: [SailPoint API Guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/#table-of-contents)

## Installation

For installation instructions see the spectral installation document: [How to install spectral](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0Mw-installation)

`npm install -g @stoplight/spectral-cli`

## VSCode Real-Time Linting

You can get real-time linting in VSCode as you edit API specification files using the Stoplight Spectral extension. This provides immediate feedback on rule violations directly in your editor.

**Quick Start:**
1. Build and link this package: `pnpm build && pnpm link --global`
2. Link in your api-specs repo: `pnpm link --global sailpoint-rulesets`
3. Install Spectral extension: `code --install-extension stoplight.spectral`
4. Open your api-specs repository in VSCode

**Documentation:**
- [Quick Start Guide](./VSCODE_QUICKSTART.md) - Fast setup reference
- [Detailed Setup Guide](./VSCODE_SETUP.md) - Complete instructions and troubleshooting

The VSCode extension automatically selects the appropriate ruleset (root, path, or schema) based on the file's location, matching the behavior of the CLI linting scripts.

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

Typically, contributions to the SailPoint OpenAPI specification involve creating a branch of the API specification in Git and making changes within the branch. Rather than having to manually run the linter on each file that was changed in the branch, we have provided [lint.sh](./lint.sh), which will automatically run the linter on only the files that have changed in the branch. To use this script, make sure you are on the correct branch of the API specification repo and run the following command in the root project directory:

```sh
sh /path/to/lint.sh
```

Or use the parallel lint script to greatly speed up the linting process:

```sh
sh /path/to/lint-parallel.sh
```

This script uses the git command `git diff --name-only HEAD master` to print the file paths that have changed, and then it loops through each file and applies the appropriate ruleset based on whether the file is a root spec file, path file, or schema file. This script also has the benefit of referencing the rule files directly from this GitHub repository, so it will always apply the latest rules without the user having to download or synchronize any files.

## Understanding the Linter Results

The linter will print every problem it finds to stdout. The following is an example of this output:
![image](https://user-images.githubusercontent.com/75683148/139263011-b9ef3881-6482-4c64-8b29-07a3aafab021.png)
The linter will print the path to the file that it linted, one or more problems, and then a summary of problems. Each problem line can be broken down as follows:

1. `20:13` indicates the line and character in the file where the problem was found.
2. `error` indicates the severity of the problem found. `error` translates to a `MUST` in the [API guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/), `warn` translates to `SHOULD`, and `info` translates`to`MAY`.
3. `path-must-define-specific-response-codes` is the name of the rule in the API guidelines that has been violated.
4. `Rule 151:` is the rule number in the API guidelines. You can use this number to look up more information about that rule in the guidelines.
5. `Operation must have the following ...` is a detailed description of the violation

If the linter reports no problems, then the spec has passed the linter.

## Local Development

You will need to clone an api-specs repo for local development.

An example command for running with a local version of the path ruleset:

```
spectral lint ~/path-to-spec/path.yaml --ruleset path-ruleset.yaml --ignore-unknown-format
```

Forward slashes must be used in the filepath to the yaml file on Windows systems:

Relative path:

```
spectral lint ../cloud-api-client-common/api-specs/src/main/yaml/v3/paths/identity-profiles.yaml --ruleset path-ruleset.yaml --ignore-unknown-format
```

Absolute path

```
spectral lint C:/users/username/documents/git/cloud-api-client-common/api-specs/src/main/yaml/v3/paths/identity-profiles.yaml --ruleset path-ruleset.yaml --ignore-unknown-format
```

## Testing for Local Development

1. Install mocha testing framework: `npm install --global mocha`
2. Tests must be written for custom functions and placed in the functions/tests folder. Tests are not required to be written for rules utlizing spectral core functions.
3. Run the tests on any of the files in the functions/tests folder: `mocha functions/tests/deprecation-test.js`
