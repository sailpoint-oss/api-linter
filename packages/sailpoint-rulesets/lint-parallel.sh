#!/bin/bash

lint_file () {
    LINTER_URL="https://raw.githubusercontent.com/sailpoint-oss/api-linter/main/packages/sailpoint-rulesets"

    # A collection in apis/<name>/ has an openapi.yaml root file.
    if echo $1 | grep -E "sailpoint-api\.|(^|/)openapi\.ya?ml$" --quiet
    then
        # Don't ignore unkown format because we want to know if the root API spec is a valid OpenAPI version
        spectral lint $1 --ruleset "${LINTER_URL}/root-ruleset.yaml"
    fi

    if echo $1 | grep paths --quiet
    then
        spectral lint $1 --ruleset "${LINTER_URL}/path-ruleset.yaml" --ignore-unknown-format
    fi

    if echo $1 | grep schemas --quiet
    then
        spectral lint $1 --ruleset "${LINTER_URL}/schema-ruleset.yaml" --ignore-unknown-format
    fi
}

export -f lint_file

git diff --name-only HEAD master | parallel --progress lint_file {}
