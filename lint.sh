#!/bin/sh

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

args=("$@")

if [ "${args[0]}" = "all" ] 
then
  files=$(find . -name "*.yaml")
else
  files=$(git diff --name-only HEAD main)
fi

for file in $files
do
    if echo $file | grep "sailpoint-api.*" --quiet
    then
	# Don't ignore unkown format because we want to know if the root API spec is a valid OpenAPI version
        spectral lint $file --ruleset "${SCRIPT_DIR}/root-ruleset.yaml" 
    fi

    if echo $file | grep paths --quiet
    then
        spectral lint $file --ruleset "${SCRIPT_DIR}/path-ruleset.yaml" --ignore-unknown-format
    fi

    if echo $file | grep schemas --quiet
    then
	spectral lint $file --ruleset "${SCRIPT_DIR}/schema-ruleset.yaml" --ignore-unknown-format
    fi
done