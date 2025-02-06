#!/bin/sh

LINTER_URL="https://raw.githubusercontent.com/sailpoint-oss/api-linter/main"

args=("$@")

if [ "${args[0]}" = "all" ] 
then
  files=$(find . -name "*.yaml")
else
  files=$(git diff --name-only HEAD main)
fi

for file in $files
do
    if echo $file | grep paths --quiet
    then
        spectral lint $file --ruleset "${LINTER_URL}/nerm-path-ruleset.yaml" --ignore-unknown-format
    fi

    if echo $file | grep schemas --quiet
    then
	spectral lint $file --ruleset "${LINTER_URL}/nerm-schema-ruleset.yaml" --ignore-unknown-format
    fi
done