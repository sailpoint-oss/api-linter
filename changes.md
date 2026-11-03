# Linter changes for DEVREL-3561

This document lists the lint rule changes on the `feature/DEVREL-3561` branch. The changes come from the plan in [linter.md](linter.md) and the gaps in [gap-analysis.md](gap-analysis.md). Each rule links to a guideline in the [SailPoint API guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/).

## Result

- The branch adds 72 rules: 12 root rules, 22 schema rules, 37 path rules and 1 gateway rule.
- The branch adds guideline 410 and rewrites guideline 132 in `sailpoint-api-guidelines`. See [New guideline 410](#new-guideline-410) and [Rewritten guideline 132](#rewritten-guideline-132).
- Each new rule has a valid sample and an invalid sample in `packages/sailpoint-rulesets/samples` (or `packages/gateway-rulesets/samples`).
- `npm test` passes: 455 tests in 2 test files.
- No change is committed yet.

## New root rules

File: `packages/sailpoint-rulesets/root-ruleset.yaml`. Path files do not know their own path key, so the rules for path keys are in the root ruleset.

| Rule | Guideline | Severity |
| --- | --- | --- |
| `root-tags-must-have-description` | 409 | error |
| `root-should-link-to-api-user-manual` Remove | 102 | warn | 
| `info-must-contain-meta-information` | 218 | error |
| `openapi-version-must-be-3` Remove | 101 | error | 
| `paths-must-include-version` | 115 | error |
| `paths-must-not-use-api-base-path` | 135 | error |
| `paths-must-be-normalized` | 136 | error |
| `paths-must-not-contain-org-name` | 319 | error |
| `path-segments-must-be-kebab-case` | 129 | error |
| `path-resource-names-must-be-plural` | 134 | error |
| `path-segments-should-not-contain-verbs` | 141 | warn |
| `paths-should-not-have-more-than-three-sub-resources` | 147 | warn |

New functions:

- `src/path-segment-check.ts` checks each path segment for casing, plural names, verbs and depth. It skips version segments (`v1`, `beta`). The verb check skips `bulk-*` segments, because rule 152 covers bulk operations.
- `src/path-version-check.ts` first looks at the server URLs. If each server URL ends with `/vN` or `/beta`, the rule passes. If not, each path key must have a version segment.

## New schema rules

File: `packages/sailpoint-rulesets/schema-ruleset.yaml`. All new rules use `resolved: false`, so they check only the linted file and not the files that it references.

| Rule | Guideline | Severity |
| --- | --- | --- |
| `schema-property-names-must-be-camel-case` | 118 | error |
| `schema-property-names-must-not-be-type` | 410 | error |
| `schema-enum-values-must-be-upper-snake-case` | 240 | error |
| `schema-additional-properties-must-not-be-false` | 111 | error |
| `schema-booleans-must-not-be-nullable` | 122 | error |
| `schema-arrays-must-not-be-nullable` | 124 | error |
| `schema-null-values-must-be-nullable` | 318 | error |
| `schema-examples-must-match-type-and-format` | 304 | error |
| `schema-formats-must-be-standard` | 238 | error |
| `schema-email-properties-must-use-email-format` | 238 | error |
| `schema-url-properties-must-use-uri-format` | 238 | error |
| `schema-href-must-be-uri` | 164 | error |
| `schema-date-properties-should-use-date-format` | 126 | warn |
| `schema-id-properties-must-not-be-numbers` | 320 | error |
| `schema-references-must-use-id-names` | 313 | error |
| `schema-must-not-expose-stack-traces` | 177 | error |
| `schema-deprecated-must-be-explained` | 187 | error |
| `schema-array-names-should-be-plural` | 120 | warn |
| `schema-boolean-names-should-not-use-qualifying-verbs` | 311 | warn |
| `schema-boolean-names-should-be-positive` | 312 | warn |
| `schema-maps-should-not-define-properties` | 216 | warn |
| `schema-optional-properties-must-have-default` | 316 | error |

New functions:

- `src/schema-node-check.ts` checks nullable booleans, nullable arrays, `null` values and maps that also define properties.
- `src/example-format-check.ts` makes sure that an example matches its type (string, integer, number, boolean) and its format (uuid, date-time, date, email, uri). It also checks parameter objects.

## New path rules

File: `packages/sailpoint-rulesets/path-ruleset.yaml`.

### Parameters

| Rule | Guideline | Severity |
| --- | --- | --- |
| `path-query-parameters-must-be-camel-case` | 130 | error |
| `path-parameters-must-not-be-named-type` | 410 | error |
| `path-query-parameters-must-use-standard-names` | 137 | error |
| `path-collection-parameters-must-have-standard-types` | 137 | error |
| `path-collection-parameters-should-use-shared-definition` | 137 | warn |
| `path-parameter-examples-must-be-url-friendly` | 228 | error |
| `path-id-parameters-must-not-be-numbers` | 320 | error |
| `path-must-not-define-standard-headers-as-parameters` | 178 | error |
| `path-parameter-examples-must-match-type-and-format` | 304 | error |

### Methods and status codes

| Rule | Guideline | Severity |
| --- | --- | --- |
| `path-get-and-head-must-not-have-request-body` | 148 | error |
| `path-list-operations-must-return-object` | 110 | error |
| `path-response-codes-must-be-standard` | 150 | error |
| `path-create-operations-must-return-201` | 150 | error |
| `path-async-operations-must-return-202` | 150 | error |
| `path-201-responses-must-define-location-header` | 150 | error |
| `path-single-resource-operations-must-define-404` | 148 | error |
| `path-bulk-operations-must-return-207` | 152 | error |
| `path-429-responses-must-define-rate-limit-headers` | 153 | warn |

### Responses

| Rule | Guideline | Severity |
| --- | --- | --- |
| `path-error-responses-must-use-standard-error-schema` | 326 | error |
| `path-error-responses-should-use-shared-responses` | 151 | warn |
| `path-response-headers-must-be-lowercase-kebab-case` | 132 | error |
| `path-responses-must-not-use-link-header` | 166 | error |
| `path-responses-should-use-location-instead-of-content-location` | 180 | warn |

### Media types

| Rule | Guideline | Severity |
| --- | --- | --- |
| `path-content-must-use-json-media-type` | 167 | error |
| `path-json-content-must-not-use-binary-format` | 239 | error |
| `path-media-types-should-be-standard` | 172 | warn |

### Other

| Rule | Guideline | Severity |
| --- | --- | --- |
| `path-security-must-define-scopes` | 105 | error |
| `path-deprecated-operations-must-be-explained` | 187 | error |
| `path-deprecated-apis-should-have-deprecation-and-sunset-dates` | 189 | warn |
| `path-descriptions-should-link-to-operations` | 302 | warn |

### Inline schemas

Path files can define schemas inline. These rules apply the schema checks to them:

- `schema-property-names-must-be-camel-case` (118)
- `schema-property-names-must-not-be-type` (410), for request bodies and responses
- `schema-enum-values-must-be-upper-snake-case` (240)
- `schema-booleans-must-not-be-nullable` (122)
- `schema-formats-must-be-standard` (238)
- `schema-objects-must-have-required-parameters` (317)
- `schema-optional-properties-must-have-default` (316)

New functions:

- `src/path-response-check.ts` checks the response codes of each operation. It has a table of the standard codes for each method, from guideline 150.
- `src/media-type-check.ts` checks the JSON media type and the binary format.
- `src/collection-parameter-check.ts` checks the types of `limit`, `offset`, `count`, `filters` and `sorters`.
- `src/error-response-ref-check.ts` makes sure that the codes 400, 401, 403, 404, 429 and 500 use a `$ref` to a shared response. Files in `apis/` must not reference `v3/responses/`.

## New gateway rule

File: `packages/gateway-rulesets/gateway-ruleset.yaml`.

| Rule | Severity |
| --- | --- |
| `gateway-versioned-route-should-not-set-version-start` | warn |

A route with `/v<N>` in its path uses the new versioning strategy, so it does not need `versionStart`.

## New guideline 410

File: `sailpoint-api-guidelines/chapters/json-guidelines.adoc`, after guideline 313.

Guideline 410 says that a property or a parameter must not use the name `type`. The name must include the resource or the concept, for example `workflowType` or `triggerType`. The guideline gives these reasons:

- The name `type` does not tell the consumer which kind of type the value describes.
- The name collides with the `type` keyword of the schema.
- Many SDK languages reserve the word.

The rule applies to:

- Path, query and header parameters.
- The properties of request bodies, response bodies and component schemas.

The `id` field of an object is not part of this rule, because guideline 313 allows `id` for the object's own ID.

Three lint rules use guideline 410:

| Rule | Ruleset | What it checks |
| --- | --- | --- |
| `schema-property-names-must-not-be-type` | schema | Properties in component schemas |
| `schema-property-names-must-not-be-type` | path | Properties in inline request and response schemas |
| `path-parameters-must-not-be-named-type` | path | Operation parameters and path-level parameters |

The rules do not report the `type` keyword of a schema, or `type` keys in `example`, `examples` and `default` data.

## Rewritten guideline 132

File: `sailpoint-api-guidelines/chapters/common-headers.adoc`.

The old guideline 132 was only a recommendation. It said that header names use uppercase words with hyphens, for example `If-Modified-Since`. The new guideline 132 is a MUST. It says that each response header name is lowercase kebab-case, for example `x-total-count` or `location`.

The reason is HTTP/2. HTTP/2 sends all header names in lowercase, and RFC 9113 (section 8.2.2) says that a message with an uppercase header name is malformed. The OpenAPI definition must show the names as the client receives them. This change closes item M5 in the gap analysis.

The rule `path-response-headers-must-be-lowercase-kebab-case` checks the header names of each response in a path file. A name must match `^[a-z0-9]+(-[a-z0-9]+)*$`, so `X-Total-Count` and `x_total_count` fail.

Other changes for this rule:

- The samples for rules 150, 153, 166, 180 and 189 now use lowercase header names, for example `x-total-count`, `location` and `retry-after`.
- The messages of these rules now name the headers in lowercase.
- The functions `path-response-check.ts` and `deprecation.ts` still match header names without regard to case. An old spec with `Location` still passes rule 150, but it fails rule 132.

## Fixes to existing code

- **HTML rule ID.** The rule for HTML in operation descriptions now uses guideline 408, not 405. This change is in `path-ruleset.yaml` and `nerm-path-ruleset.yaml`.
- **Exact response codes.** `src/response-validator.ts` now matches response codes exactly. Before, a key such as `4001` counted as `400`. The sample `invalid-similar-code.yaml` tests this.
- **Deprecation headers.** The old `src/deprecation.ts` looked for request headers, so it never passed. It now makes sure that the 2xx responses of a deprecated operation define the `Deprecation` and `Sunset` headers. Rule 189 is turned on.
- **Root files in CI.** The PR action (`packages/github-spectral-comment/src/action.ts`) and both lint scripts now run the root ruleset on collection `openapi.yaml` files, as well as `sailpoint-api.*` files.
- **Ruleset URL.** `lint.sh` and `lint-parallel.sh` used a URL without `packages/sailpoint-rulesets/`. The URL is now correct.
- **Shell.** `lint-parallel.sh` uses `export -f`, which needs bash. Its first line is now `#!/bin/bash`.

## Decisions to review

- **Rule 153 is a warning.** The guideline is a MUST. But the shared `429.yaml` has no `Retry-After` header, so about 1,000 operations fail because of that one file. Change the rule to an error after the shared file is fixed. A comment in `path-ruleset.yaml` marks this.
- **Rule 326 skips 401 and 429.** The API gateway returns those response bodies (`{error}` and `{message}`), not the services.
- **Rule 240 allows ISO codes.** Values such as `en` and `en-US` pass, as the guideline says.
- **Rule 141 skips bulk segments.** Before this exemption, the rule reported 1,001 hits.

## Expected failures on current specs

These counts come from a run on `api-specs/src/main/yaml/apis/`:

| Rule | Hits |
| --- | --- |
| 141 (verbs in paths) | about 1,000 warnings |
| 240 (enum casing) | 478 |
| 124 (nullable arrays) | 188 |
| 304 (examples) | 60 in schemas, about 342 in paths |
| 410 (`type` properties in schemas) | 499 in 398 files |
| 410 (`type` properties in inline schemas) | 4 in 4 files |
| 410 (parameters named `type`) | 19 in 16 files |
| 132 (response header case) | 45 in 41 files |

In `v2025/schemas/`, rule 410 reports 406 hits in 325 files. The rule is an error, so a PR that changes one of these files fails until the property is renamed.

Most of the rule 132 hits are `X-Total-Count`. In `v2025/paths/`, rule 132 reports 13 hits in 13 files.

Most of the rule 304 hits in paths come from the `X-SailPoint-Experimental` header. It has `example: true` on a string type.

## Changes after the review of not-built.md

The review of [not-built.md](not-built.md) gave a decision for each item. That file explains each decision and what the branch did. In short:

- **317:** the rule allows a missing `required` list, as the guideline says. It now checks every object, not only the top-level object.
- **110:** a new rule checks that a list operation returns an object with an `items` array. 1,148 existing path files fail. A separate ticket adds an `x-sailpoint-lint-ignore` entry to each of them.
- **316:** a new rule checks that each optional property has a default. It reports 5,172 properties in 1,051 schema files on `apis/`.
- **154:** the guideline is written. There is no lint rule.
- **176 and 314:** the guidelines are retired.
- **151, 310, 404 and 406:** the false positives are fixed.
- **159:** the rule stays. The new `x-sailpoint-lint-ignore` extension turns off any rule for one part of a spec, in the PR comment action.
- **116 and 315:** no rule is necessary.

## Not built

For a full explanation of each item, with links to the guidelines, see [not-built.md](not-built.md).

| Item | Reason |
| --- | --- |
| 230 | The guideline is optional, not a MUST. |
| Scope check against `scopeRepo.json` | No snapshot of the scope data exists. The team adds it later. |
| Banned phrases | No list of phrases exists yet. |
| 143, 170, 173, 323 | A lint rule can only guess at these. The false-positive rate is too high. |
| Gateway prefix collisions and spec version match | These need data from more than one file. |
| F8: walker rewrite | This is a large refactor, outside the scope of this branch. |

## How to test

1. Go to the root of the `api-linter` repository.
2. Run `npm test`.

To add a sample for a rule, put a `valid*.yaml` file and an `invalid*.yaml` file in `samples/<ruleset>/<rule-name>/`. Use `# expect:` and `# expect-count:` comments in the invalid file to set the expected results.
