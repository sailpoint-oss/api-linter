# SailPoint API Linter

The SailPoint API Linter extends [spectral](https://meta.stoplight.io/docs/spectral/ZG9jOjYx-overview) an API specification linting tool that uses custom built rulesets to lint api specifications in order to provide feedback on what rules "Must" and "Should" be followed in API specifications. For a list of our API Guidelines refer to: [SailPoint API Guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/#table-of-contents)

## Installation
For installation instructions see the spectral installation document: [How to install spectral](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0Mw-installation)


## Rulesets

We have split up our rules to run on the root level api spec, path operations, and schema objects. We did this in order to provide targeted results to a single file so that our teams could manage the results of the linter instead of receiving an unmanageable set of errors.

### Root Ruleset

The root ruleset will lint various rules on the root object for example the info object, tags, paths etc.

An example command to run on the root api specification:

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

The Schema ruleset will lint the schema objects used in the api specification, examples include checking that each property has an example and description, that the object has a required key specifying what properties in the schema are required.

An example command for running the schema ruleset:

```
spectral lint ~/path-to-spec/schema.yaml --ruleset https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/schema-ruleset.yaml --ignore-unknown-format
```
