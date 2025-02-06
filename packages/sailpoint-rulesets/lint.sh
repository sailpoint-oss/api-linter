#!/bin/sh

LINTER_URL="https://raw.githubusercontent.com/sailpoint-oss/api-linter/main"

for file in $(git diff --name-only HEAD master)
do
    if echo $file | grep "sailpoint-api.*" --quiet
    then
	# Don't ignore unkown format because we want to know if the root API spec is a valid OpenAPI version
        spectral lint $file --ruleset "${LINTER_URL}/root-ruleset.yaml" 
    fi

    if echo $file | grep paths --quiet
    then
        spectral lint $file --ruleset "${LINTER_URL}/path-ruleset.yaml" --ignore-unknown-format
    fi

    if echo $file | grep schemas --quiet
    then
	spectral lint $file --ruleset "${LINTER_URL}/schema-ruleset.yaml" --ignore-unknown-format
    fi
done