#!/usr/bin/env node

/**
 * Verification script for VSCode Spectral setup
 * 
 * This script checks if the necessary components are properly configured
 * for VSCode real-time linting with SailPoint rulesets.
 * 
 * Run from api-specs repository:
 * node C:/git/api-linter/packages/sailpoint-rulesets/verify-vscode-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark(passed) {
  return passed ? '✓' : '✗';
}

async function main() {
  log('\n=== VSCode Spectral Setup Verification ===\n', 'blue');
  
  let allPassed = true;
  
  // Check 1: Verify we're in the right directory (assuming run from api-specs)
  log('Checking current directory...', 'blue');
  const currentDir = process.cwd();
  const isApiSpecsRepo = fs.existsSync(path.join(currentDir, 'src', 'main', 'yaml'));
  
  if (isApiSpecsRepo) {
    log(`${checkMark(true)} Running from api-specs repository: ${currentDir}`, 'green');
  } else {
    log(`${checkMark(false)} Not in api-specs repository. Please run from the api-specs directory.`, 'red');
    log(`  Current directory: ${currentDir}`, 'yellow');
    allPassed = false;
  }
  
  // Check 2: Verify .spectral.yaml exists
  log('\nChecking for .spectral.yaml configuration...', 'blue');
  const spectralConfigPath = path.join(currentDir, '.spectral.yaml');
  const hasSpectralConfig = fs.existsSync(spectralConfigPath);
  
  if (hasSpectralConfig) {
    log(`${checkMark(true)} Found .spectral.yaml`, 'green');
    
    // Check if it references api-linter with relative paths
    const configContent = fs.readFileSync(spectralConfigPath, 'utf-8');
    const hasCorrectPath = configContent.includes('../api-linter/packages/sailpoint-rulesets');
    
    if (hasCorrectPath) {
      log(`${checkMark(true)} Configuration uses correct relative path to api-linter`, 'green');
    } else {
      log(`${checkMark(false)} Configuration does not use correct relative path`, 'yellow');
      log('  Expected to find "../api-linter/packages/sailpoint-rulesets" in .spectral.yaml', 'yellow');
      
      // Check if it might be using old linking method
      if (configContent.includes('sailpoint-rulesets')) {
        log('  Configuration appears to use package linking instead of relative paths', 'yellow');
        log('  Consider updating to use relative paths for consistency', 'yellow');
      }
    }
  } else {
    log(`${checkMark(false)} .spectral.yaml not found`, 'red');
    log('  Expected location: ' + spectralConfigPath, 'yellow');
    allPassed = false;
  }
  
  // Check 3: Verify api-linter repository exists in parent directory
  log('\nChecking for api-linter repository...', 'blue');
  const apiLinterPath = path.join(currentDir, '..', 'api-linter', 'packages', 'sailpoint-rulesets');
  const hasApiLinter = fs.existsSync(apiLinterPath);
  
  if (hasApiLinter) {
    log(`${checkMark(true)} api-linter repository found at ../api-linter`, 'green');
    
    // Check for compiled functions
    const functionsPath = path.join(apiLinterPath, 'functions');
    const hasFunctions = fs.existsSync(functionsPath);
    
    if (hasFunctions) {
      const functionFiles = fs.readdirSync(functionsPath).filter(f => f.endsWith('.js'));
      log(`${checkMark(true)} Found ${functionFiles.length} compiled function files`, 'green');
      
      if (functionFiles.length === 0) {
        log(`${checkMark(false)} functions/ directory is empty`, 'red');
        log('  Run "pnpm build" in the api-linter/packages/sailpoint-rulesets directory', 'yellow');
        allPassed = false;
      }
    } else {
      log(`${checkMark(false)} functions/ directory not found`, 'red');
      log('  Run "pnpm build" in the api-linter/packages/sailpoint-rulesets directory', 'yellow');
      allPassed = false;
    }
    
    // Check for YAML rulesets
    const rulesets = ['root-ruleset.yaml', 'path-ruleset.yaml', 'schema-ruleset.yaml'];
    let missingRulesets = [];
    
    for (const ruleset of rulesets) {
      if (!fs.existsSync(path.join(apiLinterPath, ruleset))) {
        missingRulesets.push(ruleset);
      }
    }
    
    if (missingRulesets.length === 0) {
      log(`${checkMark(true)} All ruleset YAML files found`, 'green');
    } else {
      log(`${checkMark(false)} Missing rulesets: ${missingRulesets.join(', ')}`, 'red');
      allPassed = false;
    }
  } else {
    log(`${checkMark(false)} api-linter repository not found`, 'red');
    log('  Expected location: C:\\git\\cloud-api-client-common\\api-linter', 'yellow');
    log('  Run: cd C:\\git\\cloud-api-client-common && git clone git@github.com:sailpoint-oss/api-linter.git', 'yellow');
    allPassed = false;
  }
  
  // Check 4: Look for sample files to test
  if (isApiSpecsRepo) {
    log('\nChecking for test files...', 'blue');
    const testPaths = [
      'src/main/yaml/v2024/paths',
      'src/main/yaml/v2024/schemas',
      'src/main/yaml/sailpoint-api.v2024.yaml'
    ];
    
    let foundTestFiles = 0;
    for (const testPath of testPaths) {
      const fullPath = path.join(currentDir, testPath);
      if (fs.existsSync(fullPath)) {
        foundTestFiles++;
      }
    }
    
    if (foundTestFiles > 0) {
      log(`${checkMark(true)} Found test files in expected locations`, 'green');
    } else {
      log(`${checkMark(false)} Could not find expected test files`, 'yellow');
    }
  }
  
  // Check 5: VSCode settings
  log('\nChecking VSCode settings...', 'blue');
  const vscodeSettingsPath = path.join(currentDir, '.vscode', 'settings.json');
  const hasVscodeSettings = fs.existsSync(vscodeSettingsPath);
  
  if (hasVscodeSettings) {
    log(`${checkMark(true)} Found .vscode/settings.json`, 'green');
    
    const settingsContent = fs.readFileSync(vscodeSettingsPath, 'utf-8');
    const hasSpectralSettings = settingsContent.includes('spectral.enable');
    
    if (hasSpectralSettings) {
      log(`${checkMark(true)} Spectral settings configured`, 'green');
    } else {
      log(`  Spectral settings not found (optional)`, 'yellow');
    }
  } else {
    log(`  .vscode/settings.json not found (optional)`, 'yellow');
    log('  You can configure Spectral in VSCode user settings instead', 'yellow');
  }
  
  // Summary
  log('\n=== Summary ===\n', 'blue');
  
  if (allPassed) {
    log('All critical checks passed! ✓', 'green');
    log('\nNext steps:', 'blue');
    log('1. Install Spectral VSCode extension: code --install-extension stoplight.spectral');
    log('2. Open VSCode in this directory: code .');
    log('3. Open a YAML file (e.g., src/main/yaml/v2024/paths/accounts.yaml)');
    log('4. Look for real-time linting feedback in the editor\n');
  } else {
    log('Some checks failed. Please review the errors above. ✗', 'red');
    log('\nSetup summary:', 'yellow');
    log('1. Clone api-linter: cd C:\\git\\cloud-api-client-common && git clone git@github.com:sailpoint-oss/api-linter.git', 'yellow');
    log('2. Build rulesets: cd api-linter\\packages\\sailpoint-rulesets && pnpm install && pnpm build', 'yellow');
    log('3. Install extension: code --install-extension stoplight.spectral', 'yellow');
    log('\nRefer to VSCODE_LINTING_SETUP.md for detailed instructions.\n', 'yellow');
    process.exit(1);
  }
}

main().catch(err => {
  log(`\nError: ${err.message}`, 'red');
  process.exit(1);
});

