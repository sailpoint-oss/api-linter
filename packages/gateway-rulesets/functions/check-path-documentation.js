import { createOptionalContextRulesetFunction } from "./createOptionalContextRulesetFunction.js";
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
const consolidatedRouteDocumentation = new Set();
let IterationOne = true;
export default createOptionalContextRulesetFunction({
    input: null,
    options: {},
}, (targetVal, options) => {
    let results = [];
    // Gets the routes from YAML files only once
    if (IterationOne) {
        getRoutesFromYaml(consolidatedRouteDocumentation);
        IterationOne = false;
    }
    // Check if the path is documented only if the API is not private
    if (targetVal.apiState !== "private" && !consolidatedRouteDocumentation.has(targetVal.path)) {
        results.push({
            message: `Path documentation is missing`
        });
    }
    return results;
});
// Function to get routes from YAML files and add them to the set
function getRoutesFromYaml(routeSet) {
    const yamlFilePaths = getYamlFilePaths();
    for (const yamlFilePath of yamlFilePaths) {
        const yamlData = readYamlFile(yamlFilePath);
        if (yamlData.paths) {
            for (const routePath of Object.keys(yamlData.paths)) {
                routeSet.add(routePath);
            }
        }
    }
}
// Function to get all YAML file paths from the test-files directory
function getYamlFilePaths() {
    const testFilesDir = 'api-specs/src/main/yaml';
    if (!fs.existsSync(testFilesDir)) {
        return [];
    }
    const files = fs.readdirSync(testFilesDir);
    return files
        .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.yaml' || ext === '.yml';
    })
        .map(file => path.join(testFilesDir, file));
}
// Function to read a YAML file and return its content
const readYamlFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContent);
};
//# sourceMappingURL=check-path-documentation.js.map