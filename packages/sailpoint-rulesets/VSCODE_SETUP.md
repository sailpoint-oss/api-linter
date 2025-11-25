# VSCode Real-Time Linting Setup for SailPoint API Specifications

This guide explains how to set up real-time linting in VSCode for SailPoint OpenAPI specifications using the Stoplight Spectral extension and the custom SailPoint rulesets.

## Overview

Once configured, you'll get:
- Real-time linting as you type in OpenAPI YAML files
- Inline error/warning indicators in the editor
- Automatic ruleset selection based on file type (root, path, schema)
- Integration with VSCode's Problems panel
- The same rules and custom functions used in CI/CD pipelines

## Prerequisites

1. **Node.js and pnpm**: Ensure you have Node.js (v16+) and pnpm installed
   ```bash
   node --version  # Should be v16 or higher
   pnpm --version  # Should be installed
   ```

2. **Git Repositories**: You need both repositories cloned:
   - `C:\git\api-linter` - Contains the rulesets and custom functions
   - `C:\git\cloud-api-client-common\api-specs` - Contains the API specifications to lint

3. **VSCode**: Visual Studio Code installed

## Installation Steps

### Step 1: Build the Rulesets Package

The custom TypeScript functions need to be compiled to JavaScript before Spectral can use them.

```powershell
# Navigate to the api-linter rulesets package
cd C:\git\api-linter\packages\sailpoint-rulesets

# Build the TypeScript functions
pnpm build
```

This compiles the TypeScript files in `src/` to JavaScript files in `functions/`.

### Step 2: Link the Rulesets Package Globally

Create a global link to the rulesets package so other projects can reference it:

```powershell
# Still in the sailpoint-rulesets directory
pnpm link --global
```

You should see output indicating the package was linked globally.

### Step 3: Link the Package in api-specs Repository

Now link the package into your api-specs repository:

```powershell
# Navigate to the api-specs repository
cd C:\git\cloud-api-client-common\api-specs

# Link the sailpoint-rulesets package
pnpm link --global sailpoint-rulesets
```

This creates a symlink in `node_modules/sailpoint-rulesets` pointing to your local rulesets package.

### Step 4: Verify the Configuration File

A `.spectral.yaml` configuration file should already exist in the root of the api-specs repository. If not, create it with the following content:

```yaml
# Spectral configuration for SailPoint API Specifications
extends: []

overrides:
  # Root-level API specification files
  - files:
      - 'src/main/yaml/sailpoint-api.*.yaml'
    extends:
      - - sailpoint-rulesets/root-ruleset.yaml
        - all
    
  # Path operation files
  - files:
      - 'src/main/yaml/**/paths/**/*.yaml'
    extends:
      - - sailpoint-rulesets/path-ruleset.yaml
        - all
    
  # Schema definition files
  - files:
      - 'src/main/yaml/**/schemas/**/*.yaml'
    extends:
      - - sailpoint-rulesets/schema-ruleset.yaml
        - all

parserOptions:
  incompatibleValues: warn
```

### Step 5: Install Spectral VSCode Extension

Install the official Stoplight Spectral extension:

**Option A - Via VSCode UI:**
1. Open VSCode
2. Click the Extensions icon in the sidebar (or press `Ctrl+Shift+X`)
3. Search for "Spectral"
4. Find "Spectral" by Stoplight
5. Click "Install"

**Option B - Via Command Line:**
```powershell
code --install-extension stoplight.spectral
```

### Step 6: Configure VSCode Settings (Optional)

You can customize Spectral's behavior in VSCode settings. Open settings (`Ctrl+,`) and search for "Spectral":

Recommended settings:
- **Spectral: Enable** - Ensure it's checked (enabled by default)
- **Spectral: Run** - Set to `onType` for real-time linting or `onSave` for less frequent checks
- **Spectral: Validate Languages** - Ensure `yaml` is included
- **Spectral: Validate Files** - Should include `*.yaml` patterns

Or add to your `.vscode/settings.json`:
```json
{
  "spectral.enable": true,
  "spectral.run": "onType",
  "spectral.rulesetFile": ".spectral.yaml",
  "spectral.validateLanguages": ["yaml", "json"],
  "spectral.validateFiles": [
    "**/*.yaml",
    "**/*.yml"
  ]
}
```

## Verifying the Setup

### Test 1: Open a Path File

1. Open VSCode in the api-specs repository:
   ```powershell
   cd C:\git\cloud-api-client-common\api-specs
   code .
   ```

2. Open a path file, for example: `src/main/yaml/v2024/paths/access-profiles.yaml`

3. You should see:
   - Squiggly underlines on any linting errors
   - Problems listed in the Problems panel (`Ctrl+Shift+M`)
   - Hover over underlined sections to see error details

### Test 2: Check the Output Panel

1. Open the Output panel: `View` → `Output` (or `Ctrl+Shift+U`)
2. Select "Spectral" from the dropdown
3. You should see logs like:
   ```
   [Info] Spectral: Linting file:///.../v2024/paths/access-profiles.yaml
   [Info] Spectral: Found N issues
   ```

### Test 3: Verify Correct Ruleset Selection

To verify the correct ruleset is being applied:

1. Open a **path file** (e.g., `v2024/paths/account.yaml`)
   - Should see path-specific rules like "Rule 304: Parameters must have examples"

2. Open a **schema file** (e.g., `v2024/schemas/Account.yaml`)
   - Should see schema-specific rules like "Rule 317: Objects must have required parameters"

3. Open a **root file** (e.g., `sailpoint-api.v2024.yaml`)
   - Should see root-level rules like "Rule 403: Tags must be in alphabetical order"

## Making Updates to Rulesets

When you modify the custom functions or rulesets:

1. **Edit the files** in `C:\git\api-linter\packages\sailpoint-rulesets\`

2. **Rebuild** the package:
   ```powershell
   cd C:\git\api-linter\packages\sailpoint-rulesets
   pnpm build
   ```

3. **Reload VSCode** to pick up the changes:
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - Press Enter

The linked package means changes are immediately available (after rebuild) without re-linking.

## Troubleshooting

### Issue: "Cannot find module 'sailpoint-rulesets'"

**Solution**: The package link is missing. Re-run the linking steps:
```powershell
cd C:\git\api-linter\packages\sailpoint-rulesets
pnpm link --global

cd C:\git\cloud-api-client-common\api-specs
pnpm link --global sailpoint-rulesets
```

### Issue: "Function 'X' not found"

**Solution**: The TypeScript files haven't been compiled. Build the package:
```powershell
cd C:\git\api-linter\packages\sailpoint-rulesets
pnpm build
```

### Issue: No linting errors appear

**Checklist**:
1. Spectral extension is installed and enabled
2. `.spectral.yaml` exists in the api-specs root
3. The file you're editing matches one of the override patterns
4. Check the Output panel (Spectral) for error messages
5. Try reloading VSCode window (`Ctrl+Shift+P` → "Reload Window")

### Issue: Different errors than CLI linting

**Cause**: The VSCode extension might be using cached rulesets or an old build.

**Solution**:
1. Rebuild the rulesets package
2. Reload VSCode window
3. Clear the Spectral cache by restarting VSCode completely

### Issue: "Unknown format" errors

**Cause**: Individual path/schema files aren't complete OpenAPI specs.

**Solution**: This is handled by the `parserOptions.incompatibleValues: warn` setting in `.spectral.yaml`. If you still see issues, ensure your `.spectral.yaml` includes this setting.

## Understanding the Automatic Ruleset Selection

The `.spectral.yaml` file uses Spectral's `overrides` feature to apply different rulesets based on file paths:

| File Pattern | Ruleset Applied | Example Files |
|--------------|----------------|---------------|
| `sailpoint-api.*.yaml` | `root-ruleset.yaml` | `sailpoint-api.v2024.yaml` |
| `**/paths/**/*.yaml` | `path-ruleset.yaml` | `v2024/paths/accounts.yaml` |
| `**/schemas/**/*.yaml` | `schema-ruleset.yaml` | `v2024/schemas/Account.yaml` |
| `**/responses/**/*.yaml` | `schema-ruleset.yaml` | `v2024/responses/400.yaml` |
| `**/webhooks/**/*.yaml` | `path-ruleset.yaml` | `v2024/webhooks/account-created.yaml` |

This mirrors the behavior of the CLI linting scripts (`lint.sh` and `lint-parallel.sh`).

## Custom Functions

The custom TypeScript functions in `packages/sailpoint-rulesets/src/` provide specialized linting logic beyond Spectral's built-in rules. These functions:

- Are written in TypeScript and compiled to JavaScript
- Export a default function compatible with Spectral's API
- Are referenced by name in the YAML rulesets
- Work identically in both CLI and VSCode environments

Examples:
- `parameter-example-check.ts` - Validates examples in parameters
- `path-oauth-scope-check.ts` - Validates OAuth scopes are defined
- `schema-properties-field-check.ts` - Validates schema property requirements

## Alternative Setup: File Path References

Instead of using pnpm link, you can use direct file path references in `.spectral.yaml`:

```yaml
overrides:
  - files: ['**/paths/**/*.yaml']
    extends:
      - - 'C:/git/api-linter/packages/sailpoint-rulesets/path-ruleset.yaml'
        - all
```

**Pros**: 
- No need to link packages
- Simpler setup

**Cons**:
- Absolute paths are less portable
- Must be updated if directory structure changes
- May not work in different environments

## Additional Resources

- [Spectral Documentation](https://meta.stoplight.io/docs/spectral/)
- [Spectral VSCode Extension](https://github.com/stoplightio/vscode-spectral)
- [SailPoint API Guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/)
- [api-linter Repository](https://github.com/sailpoint-oss/api-linter)

## Support

For issues or questions:
1. Check the Spectral Output panel in VSCode for detailed error messages
2. Review the Troubleshooting section above
3. Consult the SailPoint API Guidelines for rule explanations
4. Open an issue in the api-linter repository

