# VSCode Spectral Linting - Quick Start

Quick reference for setting up real-time linting in VSCode.

## One-Time Setup

```powershell
# 1. Build the rulesets
cd C:\git\api-linter\packages\sailpoint-rulesets
pnpm build

# 2. Link globally
pnpm link --global

# 3. Link in api-specs
cd C:\git\cloud-api-client-common\api-specs
pnpm link --global sailpoint-rulesets

# 4. Install VSCode extension
code --install-extension stoplight.spectral

# 5. Open api-specs in VSCode
code .
```

## After Updating Rulesets

```powershell
# 1. Rebuild
cd C:\git\api-linter\packages\sailpoint-rulesets
pnpm build

# 2. Reload VSCode
# Press Ctrl+Shift+P → "Reload Window"
```

## Verifying It Works

1. Open a file: `src/main/yaml/v2024/paths/accounts.yaml`
2. Look for squiggly underlines on errors
3. Check Problems panel: `Ctrl+Shift+M`
4. Check Output panel: `Ctrl+Shift+U` → Select "Spectral"

## File Types & Rulesets

| File Type | Auto-Applied Ruleset |
|-----------|---------------------|
| `sailpoint-api.*.yaml` | root-ruleset.yaml |
| `**/paths/**/*.yaml` | path-ruleset.yaml |
| `**/schemas/**/*.yaml` | schema-ruleset.yaml |
| `**/responses/**/*.yaml` | schema-ruleset.yaml |
| `**/webhooks/**/*.yaml` | path-ruleset.yaml |

## Troubleshooting

**No errors showing?**
- Check Spectral extension is installed and enabled
- Verify `.spectral.yaml` exists in api-specs root
- Check Output panel for Spectral logs
- Try reloading VSCode window

**"Cannot find module" error?**
- Re-run the linking steps above
- Ensure you ran `pnpm build`

**For detailed setup:** See [VSCODE_SETUP.md](./VSCODE_SETUP.md)

