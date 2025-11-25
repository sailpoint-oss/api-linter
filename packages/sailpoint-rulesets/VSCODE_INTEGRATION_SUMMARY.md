# VSCode Integration Summary

## What Was Implemented

This document summarizes the VSCode real-time linting integration that was added to the SailPoint API Linter project.

## Files Created/Modified

### In api-linter Repository (`C:\git\api-linter\packages\sailpoint-rulesets\`)

1. **package.json** (Modified)
   - Added `files` field to include compiled functions and YAML rulesets
   - Ensures the package can be linked and used by other projects

2. **VSCODE_SETUP.md** (New)
   - Comprehensive setup guide with detailed instructions
   - Troubleshooting section for common issues
   - Explains automatic ruleset selection
   - Complete workflow for making updates

3. **VSCODE_QUICKSTART.md** (New)
   - Quick reference card for fast setup
   - Essential commands only
   - Useful for developers who know the basics

4. **verify-vscode-setup.js** (New)
   - Validation script to check if setup is correct
   - Verifies all components are in place
   - Provides clear pass/fail feedback
   - Usage: `node verify-vscode-setup.js` (run from api-specs repo)

5. **vscode-settings-template.json** (New)
   - Template VSCode settings for optimal Spectral experience
   - Can be copied to any project using the rulesets

6. **README.md** (Modified)
   - Added new "VSCode Real-Time Linting" section
   - Links to setup guides
   - Positioned prominently after Installation section

### In api-specs Repository (`C:\git\cloud-api-client-common\api-specs\`)

1. **.spectral.yaml** (New)
   - Main configuration file for Spectral
   - Defines automatic ruleset selection using `overrides`
   - Maps file patterns to appropriate rulesets:
     - `sailpoint-api.*.yaml` → root-ruleset.yaml
     - `**/paths/**/*.yaml` → path-ruleset.yaml
     - `**/schemas/**/*.yaml` → schema-ruleset.yaml
     - `**/responses/**/*.yaml` → schema-ruleset.yaml
     - `**/webhooks/**/*.yaml` → path-ruleset.yaml
     - NERM-specific paths → nerm-path-ruleset.yaml
     - NERM-specific schemas → nerm-schema-ruleset.yaml

2. **.vscode/settings.json** (New)
   - Workspace-specific VSCode settings
   - Enables Spectral with optimal configuration
   - Sets real-time linting (`onType`)
   - Configures YAML file handling

3. **.vscode/extensions.json** (New)
   - Recommends required/helpful extensions
   - Stoplight Spectral (required)
   - RedHat YAML (helpful)
   - 42Crunch OpenAPI (helpful)

## How It Works

### Architecture

```
VSCode (with Spectral Extension)
    ↓ reads
.spectral.yaml
    ↓ references (via overrides)
sailpoint-rulesets package (linked via pnpm)
    ├── root-ruleset.yaml
    ├── path-ruleset.yaml
    ├── schema-ruleset.yaml
    └── functions/
        ├── parameter-example-check.js
        ├── path-oauth-scope-check.js
        └── [other custom functions]
```

### Automatic Ruleset Selection

The `.spectral.yaml` file uses Spectral's `overrides` feature to automatically apply different rulesets based on the file path being edited. This means:

- No manual ruleset selection needed
- Consistent with CLI linting behavior
- Different files get appropriate rule validations
- Works seamlessly as you navigate between files

### Package Linking

The setup uses `pnpm link` to create a symlink between repositories:

1. `sailpoint-rulesets` is linked globally from api-linter
2. api-specs links to the global sailpoint-rulesets
3. Changes to rulesets (after rebuild) are immediately available

This avoids:
- Publishing to npm for local development
- Copying files between repositories
- Version management complexities

## Setup Process (High-Level)

1. **Prepare Rulesets Package**
   ```bash
   cd C:\git\api-linter\packages\sailpoint-rulesets
   pnpm build
   pnpm link --global
   ```

2. **Configure api-specs Repository**
   ```bash
   cd C:\git\cloud-api-client-common\api-specs
   pnpm link --global sailpoint-rulesets
   ```

3. **Install VSCode Extension**
   ```bash
   code --install-extension stoplight.spectral
   ```

4. **Open and Use**
   ```bash
   cd C:\git\cloud-api-client-common\api-specs
   code .
   # Open any YAML file and see real-time linting
   ```

## Benefits

### For Developers

- **Immediate Feedback**: See linting errors as you type
- **Context Awareness**: Different rules for different file types
- **Consistent Rules**: Same rules as CI/CD pipeline
- **Better DX**: Inline errors, hover information, problem panel integration
- **Faster Iteration**: Fix issues before committing

### For Teams

- **Early Error Detection**: Catch issues before code review
- **Reduced CI Failures**: Fix linting issues locally first
- **Consistent Standards**: Everyone uses the same rulesets
- **Onboarding**: New developers get immediate guidance

### Technical

- **Zero Runtime Cost**: Linting happens client-side in VSCode
- **Same Functions**: Custom TypeScript functions work identically to CLI
- **Maintainable**: Single source of truth for rules
- **Extensible**: Easy to add new rules or modify existing ones

## Testing the Setup

Run the verification script from the api-specs repository:

```bash
cd C:\git\cloud-api-client-common\api-specs
node C:/git/api-linter/packages/sailpoint-rulesets/verify-vscode-setup.js
```

This checks:
- ✓ Correct directory structure
- ✓ .spectral.yaml exists and configured correctly
- ✓ sailpoint-rulesets package is linked
- ✓ Compiled functions are available
- ✓ All ruleset YAML files are present
- ✓ VSCode settings are configured

## Maintenance

### When Modifying Rulesets

1. Edit files in `C:\git\api-linter\packages\sailpoint-rulesets\`
2. Rebuild: `pnpm build`
3. Reload VSCode window in api-specs: `Ctrl+Shift+P` → "Reload Window"

### When Adding New Functions

1. Create TypeScript file in `src/`
2. Export default function compatible with Spectral API
3. Add function name to relevant ruleset YAML
4. Build: `pnpm build`
5. Reload VSCode

### When Adding New Rules

1. Edit relevant ruleset YAML file
2. No rebuild needed (YAML only)
3. Reload VSCode window to pick up changes

## Documentation Resources

For developers setting up for the first time:
- **[VSCODE_QUICKSTART.md](./VSCODE_QUICKSTART.md)** - Fast setup in 5 steps
- **[VSCODE_SETUP.md](./VSCODE_SETUP.md)** - Detailed guide with troubleshooting

For understanding the system:
- **[README.md](./README.md)** - Overall project documentation
- **[SailPoint API Guidelines](https://sailpoint-oss.github.io/sailpoint-api-guidelines/)** - Rule explanations

## Future Enhancements (Optional)

Potential improvements that could be added:

1. **Custom VSCode Extension**: Build a dedicated extension (beyond Spectral)
   - SailPoint-specific UI/UX
   - Quick fixes and auto-corrections
   - Rule documentation inline

2. **Rule Browser**: UI to browse and search available rules
3. **Auto-Fix Commands**: VSCode commands to auto-fix common issues
4. **CI Integration Dashboard**: Show CI linting results in VSCode
5. **Rule Testing**: In-editor testing of custom functions
6. **Performance Monitoring**: Track linting performance on large files

## Related Tools

The VSCode integration complements existing tooling:

- **CLI Linting** (`lint.sh`, `lint-parallel.sh`): Batch linting for CI/CD
- **GitHub Actions** (github-spectral-comment): PR comments with linting results
- **Unit Tests**: Validate custom function behavior

All tools share the same rulesets and functions, ensuring consistency across the development workflow.

