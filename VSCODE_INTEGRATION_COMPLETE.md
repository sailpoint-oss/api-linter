# VSCode Spectral Integration - Implementation Complete ✓

## Summary

The VSCode real-time linting integration has been successfully implemented for your SailPoint API specifications. You can now get immediate feedback on API linting rules as you edit YAML files in VSCode.

## What Was Done

### 1. Package Configuration
- ✓ Updated `packages/sailpoint-rulesets/package.json` to include compiled functions and YAML files
- ✓ Package is now ready to be linked to other projects

### 2. Spectral Configuration
- ✓ Created `.spectral.yaml` in the api-specs repository
- ✓ Uses relative paths to reference rulesets from `../api-linter/packages/sailpoint-rulesets/`
- ✓ Configured automatic ruleset selection based on file paths:
  - Root API files → `root-ruleset.yaml`
  - Path files → `path-ruleset.yaml`
  - Schema files → `schema-ruleset.yaml`
  - Response files → `schema-ruleset.yaml`
  - Webhook files → `path-ruleset.yaml`
  - NERM files → `nerm-*-ruleset.yaml`

### 3. VSCode Configuration
- ✓ Created `.vscode/settings.json` with optimized Spectral settings
- ✓ Created `.vscode/extensions.json` to recommend required extensions
- ✓ Settings enable real-time linting (`onType`) by default

### 4. Documentation
Created comprehensive documentation:
- ✓ **VSCODE_SETUP.md** - Detailed setup guide with troubleshooting
- ✓ **VSCODE_QUICKSTART.md** - Quick reference for fast setup
- ✓ **VSCODE_INTEGRATION_SUMMARY.md** - Technical overview
- ✓ **vscode-settings-template.json** - Settings template
- ✓ Updated main **README.md** with VSCode section

### 5. Verification Tools
- ✓ Created `verify-vscode-setup.js` script to validate the setup

## Next Steps to Enable VSCode Linting

Follow these steps to start using real-time linting. This setup clones the api-linter repository into the api-specs parent directory for a consistent, easy-to-follow configuration.

### Step 1: Clone the api-linter Repository

```powershell
# Navigate to the cloud-api-client-common directory (parent of api-specs)
cd C:\git\cloud-api-client-common

# Clone the api-linter repository
git clone git@github.com:sailpoint-oss/api-linter.git

# This creates: C:\git\cloud-api-client-common\api-linter
```

### Step 2: Build the Rulesets

```powershell
# Navigate to the rulesets package
cd C:\git\cloud-api-client-common\api-linter\packages\sailpoint-rulesets

# Install dependencies and build the TypeScript functions
pnpm install
pnpm build

# This compiles the custom functions to the functions/ directory
```

### Step 3: Install the Spectral VSCode Extension

```powershell
# Install the Spectral extension for VSCode
code --install-extension stoplight.spectral
```

### Step 4: Open VSCode and Test

```powershell
# Open VSCode in the api-specs directory
cd C:\git\cloud-api-client-common\api-specs
code .
```

Then:
1. Open any API file, e.g., `src/main/yaml/v2024/paths/accounts.yaml`
2. You should see squiggly underlines on any linting errors
3. Check the **Problems panel** (`Ctrl+Shift+M`) for all issues
4. Check the **Output panel** (`Ctrl+Shift+U` → select "Spectral") for logs

### Step 5: Verify the Setup (Optional but Recommended)

```powershell
# From the api-specs directory, run the verification script
cd C:\git\cloud-api-client-common\api-specs
node ../api-linter/packages/sailpoint-rulesets/verify-vscode-setup.js
```

This will check:
- ✓ Running from correct directory (api-specs)
- ✓ .spectral.yaml exists and references api-linter
- ✓ api-linter repository is cloned in parent directory
- ✓ Compiled functions are available in api-linter
- ✓ All necessary ruleset files are present

## How It Works

### Architecture

```
C:\git\cloud-api-client-common\
    ├── api-specs\
    │   ├── .spectral.yaml (uses relative paths)
    │   └── src\main\yaml\
    │       ├── v2024\paths\... (gets path-ruleset.yaml)
    │       ├── v2024\schemas\... (gets schema-ruleset.yaml)
    │       └── sailpoint-api.*.yaml (gets root-ruleset.yaml)
    └── api-linter\
        └── packages\sailpoint-rulesets\
            ├── root-ruleset.yaml
            ├── path-ruleset.yaml
            ├── schema-ruleset.yaml
            └── functions\
                ├── parameter-example-check.js
                ├── path-oauth-scope-check.js
                └── [other custom functions]
```

**How it connects:**
1. VSCode with Spectral Extension reads `.spectral.yaml` in api-specs
2. `.spectral.yaml` references rulesets via relative path: `../api-linter/packages/sailpoint-rulesets/`
3. Rulesets automatically load based on the file path you're editing
4. Custom TypeScript functions are loaded from the compiled `functions/` directory

**Benefits of this structure:**
- ✓ Consistent paths for all developers
- ✓ No global package linking required
- ✓ Simple setup: just clone, build, and open
- ✓ Easy to update: pull latest changes and rebuild
- ✓ Works the same way for everyone

### Automatic Ruleset Selection

The configuration automatically applies the correct ruleset based on the file you're editing:

| File Location | Ruleset Applied | Example |
|--------------|-----------------|---------|
| `sailpoint-api.*.yaml` | root-ruleset | `sailpoint-api.v2024.yaml` |
| `**/paths/**/*.yaml` | path-ruleset | `v2024/paths/accounts.yaml` |
| `**/schemas/**/*.yaml` | schema-ruleset | `v2024/schemas/Account.yaml` |
| `**/responses/**/*.yaml` | schema-ruleset | `v2024/responses/400.yaml` |
| `**/webhooks/**/*.yaml` | path-ruleset | `v2024/webhooks/account-created.yaml` |

### Real-Time Feedback

As you type in YAML files, Spectral will:
- Show inline errors with squiggly underlines
- Display hover tooltips with rule details and links
- Populate the Problems panel with all issues
- Update in real-time as you make changes

### Custom Functions

All your custom TypeScript functions work in VSCode exactly as they do in CLI:
- `parameter-example-check` - Validates parameter examples
- `path-oauth-scope-check` - Validates OAuth scopes
- `schema-properties-field-check` - Validates schema properties
- And all other custom functions...

## Making Updates

When you modify rulesets or functions:

```powershell
# 1. Make your changes in the api-linter repository
cd C:\git\cloud-api-client-common\api-linter\packages\sailpoint-rulesets

# 2. Rebuild if you changed TypeScript functions (not needed for YAML-only changes)
pnpm build

# 3. Reload VSCode window in api-specs
# Press Ctrl+Shift+P → "Reload Window"
```

Changes are immediately available because the `.spectral.yaml` uses relative paths to the local api-linter repository!

## Documentation Quick Links

- **[packages/sailpoint-rulesets/VSCODE_QUICKSTART.md](packages/sailpoint-rulesets/VSCODE_QUICKSTART.md)** - Quick start commands
- **[packages/sailpoint-rulesets/VSCODE_SETUP.md](packages/sailpoint-rulesets/VSCODE_SETUP.md)** - Detailed setup and troubleshooting
- **[packages/sailpoint-rulesets/VSCODE_INTEGRATION_SUMMARY.md](packages/sailpoint-rulesets/VSCODE_INTEGRATION_SUMMARY.md)** - Technical overview

## Files Changed

### In api-linter repository (to be cloned to `C:\git\cloud-api-client-common\api-linter\`)

**Modified:**
- `packages/sailpoint-rulesets/package.json` - Added files field for proper packaging
- `packages/sailpoint-rulesets/README.md` - Added VSCode integration section

**Created:**
- `packages/sailpoint-rulesets/VSCODE_SETUP.md` - Detailed setup instructions
- `packages/sailpoint-rulesets/VSCODE_QUICKSTART.md` - Quick reference guide
- `packages/sailpoint-rulesets/VSCODE_INTEGRATION_SUMMARY.md` - Technical overview
- `packages/sailpoint-rulesets/vscode-settings-template.json` - Settings template
- `packages/sailpoint-rulesets/verify-vscode-setup.js` - Validation script
- `VSCODE_INTEGRATION_COMPLETE.md` - This file (implementation summary)

### In api-specs repository (`C:\git\cloud-api-client-common\api-specs\`)

**Created:**
- `.spectral.yaml` - Main Spectral configuration with relative paths to api-linter
- `.vscode/settings.json` - Workspace Spectral settings
- `.vscode/extensions.json` - Recommended VSCode extensions

## Troubleshooting

### Common Issues

**"Cannot resolve ruleset" or "File not found" errors**
- Verify api-linter is cloned to: `C:\git\cloud-api-client-common\api-linter`
- Check that the path in `.spectral.yaml` is: `../api-linter/packages/sailpoint-rulesets/`
- Ensure you ran `pnpm build` in the sailpoint-rulesets directory

**No errors appearing in VSCode**
- Verify Spectral extension is installed: Extensions → Search "Spectral"
- Check Output panel: `Ctrl+Shift+U` → Select "Spectral" for error messages
- Ensure `.spectral.yaml` exists in `C:\git\cloud-api-client-common\api-specs\`
- Reload VSCode window: `Ctrl+Shift+P` → "Reload Window"

**Different results than CLI**
- Rebuild the package: `cd ../api-linter/packages/sailpoint-rulesets && pnpm build`
- Reload VSCode window
- Ensure both are using the same rulesets

**Functions not found**
- Ensure TypeScript was compiled: Check that `functions/` directory exists with .js files
- Run: `cd ../api-linter/packages/sailpoint-rulesets && pnpm install && pnpm build`

### Getting Help

1. Check the **[VSCODE_SETUP.md](packages/sailpoint-rulesets/VSCODE_SETUP.md)** troubleshooting section
2. Run the verification script: `node verify-vscode-setup.js`
3. Check Spectral output panel for detailed error messages
4. Review [Spectral documentation](https://meta.stoplight.io/docs/spectral/)

## Benefits You'll Get

✓ **Immediate Feedback** - See errors as you type, not after commit  
✓ **Consistent Rules** - Same rules as CI/CD pipeline  
✓ **Better DX** - Inline errors, hover tooltips, problems panel  
✓ **Faster Development** - Fix issues before pushing  
✓ **Reduced CI Failures** - Catch linting issues early  
✓ **Automatic Selection** - Right rules for each file type  

## What's Different from CLI?

| Feature | CLI (lint.sh) | VSCode Extension |
|---------|---------------|------------------|
| **Timing** | On-demand | Real-time |
| **Feedback** | Terminal output | Inline + Problems panel |
| **File Selection** | Git diff | Currently open file |
| **Ruleset Selection** | Script logic | .spectral.yaml overrides |
| **Custom Functions** | ✓ Supported | ✓ Supported |
| **Same Rules** | ✓ Yes | ✓ Yes |

Both use the same rulesets and functions for consistency!

## Success! 🎉

You now have a fully configured VSCode environment for real-time API linting. Once you complete the linking steps above, you'll get immediate feedback on your API specifications as you work on them.

The configuration mirrors your existing CLI linting behavior, so you'll see the same rules applied consistently across your development workflow.

Happy linting! 🚀

