# Rule samples

Each lint rule can have sample files that show what the rule accepts and what it rejects. A test runs the real ruleset on every sample. The result tells you whether the rule works.

The same layout is used for the gateway ruleset, in `packages/gateway-rulesets/samples/`.

To do the tasks in this guide from a menu, run `npm run visual-test` from the repo root. Use the arrow keys to move, Enter to pick, and type to filter the rule list.

## Layout

```
samples/
  <ruleset-name>/              # the ruleset file name without .yaml, for example path-ruleset
    <rule-name>/               # the rule name, exactly as it is in the ruleset
      valid.yaml               # the rule must report no problem
      invalid.yaml             # the rule must report at least one problem
```

The test only checks the rule of the folder. Other rules can report problems on the same sample, and the test ignores them.

To test more than one case, add more files. Each file name must start with `valid` or `invalid`, for example `invalid-missing-example.yaml`.

Some rules look at the path of the file, for example at a `v3` folder. For these rules, put the sample in subfolders, for example `<rule-name>/v3/schemas/invalid.yaml`.

## Check the message, the count, or the environment

A sample can have more checks in the comment lines at the top of the file. Put the comment that tells about the case first, and the checks after it:

```yaml
# The summary has 7 words, and the limit is 5.
# expect: should not exceed 5 words
# expect-count: 1
# env: VERSIONED_OPERATION_IDS=["getIdentity","listIdentities"]
get:
  ...
```

- `# expect: <text>`: a problem from the rule must contain this text. You can use more than one line. This check works only in `invalid` files.
- `# expect-count: <n>`: the rule must report exactly this number of problems in the file.
- `# env: NAME=value`: the test sets this environment variable while it runs the sample. Some rules read environment variables, for example `VERSIONED_OPERATION_IDS` or `V3_TAGS_JSON`.

## Add samples for a rule

1. Create the folder and two starter files:

   ```sh
   npm run new-rule-sample -- <rule-name>
   ```

   The script finds the ruleset that has the rule, and it shows the rule definition.

2. Edit `valid.yaml` so that it follows the rule.
3. Edit `invalid.yaml` so that it breaks the rule. Put a comment at the top that tells why the file breaks the rule.
4. Run the samples for the rule:

   ```sh
   npm run test:rules -- -t <rule-name>
   ```

## Run all samples

```sh
npm run test:rules
```

This command builds the rule functions first, because the rulesets load the compiled `functions/` folder. A rule that has no samples shows as "todo" in the output, so the output also tells you which rules still need samples.

If a test fails, the message shows the sample file and every problem that Spectral reported for it.

## See the PR comment for a sample

The `github-spectral-comment` action makes the lint comment on a PR. It uses the folder name of a sample to select the ruleset. It does not load the NERM rulesets.

To make the comment locally, run this command from the repo root. The comment goes to `packages/github-spectral-comment/output.md`.

```sh
FILE_GLOB=packages/sailpoint-rulesets/samples/path-ruleset/path-tag-check/invalid.yaml pnpm --filter github-spectral-comment test
```

To list more than one file, separate the paths with commas. If you do not set `FILE_GLOB`, the command uses a default set of samples.

To do the same in GitHub, start the "Action Preview" workflow by hand, and enter the files in the `file-glob` field. The comment shows on the summary page of the run. On a PR, the workflow uses the default set of samples.

## See the Spectral output

To see the normal Spectral output for one sample, run this command from the `packages` folder:

```sh
npx spectral lint sailpoint-rulesets/samples/path-ruleset/<rule-name>/invalid.yaml --ruleset sailpoint-rulesets/path-ruleset.yaml --ignore-unknown-format
```
