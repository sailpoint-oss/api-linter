import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";

/**
 * Parses OpenAPI specification files and generates a structured object
 * with API endpoints categorized by file name, path, method, and status
 */
class OpenAPIParser {
  
  /**
   * Main function to process multiple OpenAPI spec files
   * @param {string[]} filePaths - Array of file paths to OpenAPI spec files
   * @returns {Object} Structured object with the format described
   */
  async parseSpecFiles(filePaths) {
    const result = {};
    
    for (const filePath of filePaths) {
      try {
        // Extract filename without extension as the top-level key
        const fileName = path.basename(filePath, path.extname(filePath));
        
        // Read and parse the spec file
        const specData = await this.readSpecFile(filePath);
        
        // Process the spec and add to result
        result[fileName] = this.processSpec(specData);
        
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
      }
    }
    
    return result;
  }
  
  /**
   * Reads and parses a spec file (supports JSON and YAML)
   * @param {string} filePath - Path to the spec file
   * @returns {Object} Parsed specification object
   */
  async readSpecFile(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const extension = path.extname(filePath).toLowerCase();
    
    if (extension === '.json') {
      return JSON.parse(fileContent);
    } else if (extension === '.yaml' || extension === '.yml') {
      return yaml.load(fileContent);
    } else {
      throw new Error(`Unsupported file format: ${extension}`);
    }
  }
  
  /**
   * Processes a single OpenAPI specification
   * @param {Object} spec - The parsed OpenAPI specification
   * @returns {Object} Processed paths with methods and their status
   */
  processSpec(spec) {
    const result = {};
    
    if (!spec.paths) {
      console.warn('No paths found in specification');
      return result;
    }
    
    // Iterate through each path in the spec
    for (const [pathName, pathObj] of Object.entries(spec.paths)) {
      result[pathName] = {};
      
      // Iterate through each HTTP method for this path
      for (const [method, methodObj] of Object.entries(pathObj)) {
        // Skip non-HTTP method properties (like parameters, summary, etc.)
        if (!this.isHttpMethod(method)) {
          continue;
        }
        
        // Determine if this endpoint is experimental
        const status = this.determineEndpointStatus(methodObj, spec);
        result[pathName][method.toUpperCase()] = status;
      }
    }
    
    return result;
  }
  
  /**
   * Determines if an endpoint is public or public-preview based on headers
   * @param {Object} methodObj - The method object from the OpenAPI spec
   * @param {Object} spec - The full specification (for global parameters)
   * @returns {string} Either "public" or "public-preview"
   */
  determineEndpointStatus(methodObj, spec) {
    // Check parameters in the method itself
    if (methodObj.parameters) {
      for (const param of methodObj.parameters) {
        if (param.name === 'X-SailPoint-Experimental' && param.in === 'header') {
          return 'public-preview';
        }
      }
    }
    
    // Check global parameters if they exist
    if (spec.components && spec.components.parameters) {
      for (const [paramName, paramObj] of Object.entries(spec.components.parameters)) {
        if (paramObj.name === 'X-SailPoint-Experimental' && paramObj.in === 'header') {
          // Check if this parameter is referenced in the method
          if (methodObj.parameters) {
            const hasRef = methodObj.parameters.some(param => 
              param.$ref === `#/components/parameters/${paramName}`
            );
            if (hasRef) {
              return 'public-preview';
            }
          }
        }
      }
    }
    
    // Check if the header is defined in the operation's responses or other locations
    if (this.hasExperimentalHeader(methodObj)) {
      return 'public-preview';
    }
    
    return 'public';
  }
  
  /**
   * Checks if an operation has the experimental header defined anywhere
   * @param {Object} methodObj - The method object to check
   * @returns {boolean} True if experimental header is found
   */
  hasExperimentalHeader(methodObj) {
    // Check in responses
    if (methodObj.responses) {
      for (const response of Object.values(methodObj.responses)) {
        if (response.headers && response.headers['X-SailPoint-Experimental']) {
          return true;
        }
      }
    }
    
    // Check in request body headers (if any)
    if (methodObj.requestBody && methodObj.requestBody.content) {
      for (const content of Object.values(methodObj.requestBody.content)) {
        if (content.schema && content.schema.properties) {
          for (const prop of Object.values(content.schema.properties)) {
            if (prop['X-SailPoint-Experimental'] || prop.name === 'X-SailPoint-Experimental') {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Checks if a string represents an HTTP method
   * @param {string} method - The method string to check
   * @returns {boolean} True if it's an HTTP method
   */
  isHttpMethod(method) {
    const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];
    return httpMethods.includes(method.toLowerCase());
  }
}

/**
 * Usage example and main execution function
 */
(async () => {
  try {
    const parser = new OpenAPIParser();
    
    // Example usage - replace with your actual file paths
    const filePaths = [
      '/2025.yaml',
      './2024.yaml',
      // Add more file paths as needed
    ];
    
    const result = await parser.parseSpecFiles(filePaths);
    
    // Output the result
    // console.log(JSON.stringify(result));
    
    // Optionally save to file
    await fs.writeFile('api-state-data.json', JSON.stringify(result));    
  } catch (error) {
    console.error('Error in main execution:', error);
  }
})();