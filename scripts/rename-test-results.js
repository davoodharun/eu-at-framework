const fs = require('fs');
const path = require('path');

/**
 * Script to rename test result folders to be more descriptive
 * Run this after tests complete to organize test results better
 */

function renameTestResultFolders() {
  const testResultsDir = 'test-results';
  
  if (!fs.existsSync(testResultsDir)) {
    console.log('No test-results directory found');
    return;
  }

  const folders = fs.readdirSync(testResultsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Found ${folders.length} test result folders to process`);

  folders.forEach(folder => {
    try {
      const folderPath = path.join(testResultsDir, folder);
      const files = fs.readdirSync(folderPath);
      
      // Look for error-context.md file which contains test information
      const errorContextFile = files.find(file => file === 'error-context.md');
      
      if (errorContextFile) {
        const errorContextPath = path.join(folderPath, errorContextFile);
        const content = fs.readFileSync(errorContextPath, 'utf8');
        
        // Try to extract test information from error context first
        let testInfo = extractTestInfoFromErrorContext(content);
        
        // If that fails, try to extract from folder name
        if (!testInfo || testInfo.testName === 'unknown-test') {
          testInfo = extractTestInfoFromFolderName(folder);
        }
        
        // If that fails, try to extract from JSON results
        if (!testInfo || testInfo.testName === 'unknown-test') {
          const jsonTestInfos = extractTestInfoFromJsonResults();
          if (jsonTestInfos && Array.isArray(jsonTestInfos) && jsonTestInfos.length > 0) {
            // Find a matching test info based on folder index or opco
            const folderIndex = parseInt(folder.match(/\d+/)?.[0] || '0');
            const testIndex = folderIndex % jsonTestInfos.length;
            testInfo = jsonTestInfos[testIndex];
            console.log(`Using test info from JSON (index ${testIndex}): ${testInfo.testName} - ${testInfo.opco}`);
          }
        }
        
        if (testInfo && testInfo.testName !== 'unknown-test') {
          const newFolderName = createDescriptiveFolderName(testInfo);
          const newFolderPath = path.join(testResultsDir, newFolderName);
          
          // Rename the folder
          if (!fs.existsSync(newFolderPath)) {
            fs.renameSync(folderPath, newFolderPath);
            console.log(`Renamed: ${folder} -> ${newFolderName}`);
          } else {
            console.log(`Skipped: ${newFolderName} already exists`);
          }
        } else {
          console.log(`Could not extract test info from: ${folder}`);
        }
      }
    } catch (error) {
      console.error(`Error processing folder ${folder}:`, error.message);
    }
  });
}

function extractTestInfoFromErrorContext(content) {
  try {
    // The error context file might not contain the test name in the expected format
    // Let's try to extract from the content structure
    console.log('Error context content:', content.substring(0, 200));
    return null; // For now, return null to try other methods
  } catch (error) {
    console.error('Error extracting test info from error context:', error.message);
    return null;
  }
}

function extractTestInfoFromFolderName(folderName) {
  try {
    // Example folder name: "e2e-reusable-login-example-12b52-in-e2e-multi-opco-env-stage-chromium"
    
    // Extract environment
    let environment = 'unknown-env';
    if (folderName.includes('env-stage')) {
      environment = 'stage';
    } else if (folderName.includes('env-prod')) {
      environment = 'production';
    }
    
    // Extract test type
    let testName = 'unknown-test';
    if (folderName.includes('reusable-login-example')) {
      testName = 'reusable-login-example';
    } else if (folderName.includes('login')) {
      testName = 'login-test';
    } else if (folderName.includes('api')) {
      testName = 'api-test';
    } else if (folderName.includes('e2e')) {
      testName = 'e2e-test';
    }
    
    // Extract opco from folder name patterns
    let opco = 'unknown-opco';
    const opcoPatterns = [
      /-([a-z]+)-/, // Pattern: "test-name-opco-"
      /([a-z]+)-failed/, // Pattern: "opco-failed"
      /([a-z]+)-stage/, // Pattern: "opco-stage"
      /([a-z]+)-prod/ // Pattern: "opco-prod"
    ];
    
    for (const pattern of opcoPatterns) {
      const match = folderName.match(pattern);
      if (match) {
        opco = match[1];
        break;
      }
    }
    
    return {
      testName,
      opco: opco,
      environment,
      status: 'failed'
    };
  } catch (error) {
    console.error('Error extracting test info from folder name:', error.message);
    return null;
  }
}

function extractTestInfoFromJsonResults() {
    const jsonFile = fs.existsSync('test-results/stage-results.json') ? 'test-results/stage-results.json' : 
                     fs.existsSync('test-results/prod-results.json') ? 'test-results/prod-results.json' : null;
    
    if (!jsonFile) {
        console.log('No JSON results file found');
        return null;
    }

    try {
        const jsonContent = fs.readFileSync(jsonFile, 'utf8');
        const results = JSON.parse(jsonContent);
        
        const failedTests = findFailedTests(results);
        
        if (failedTests.length === 0) {
            console.log('No failed tests found in JSON results');
            return null;
        }

        // Return all failed tests info
        console.log(`Found ${failedTests.length} failed tests in JSON results`);
        return failedTests;
    } catch (error) {
        console.error('Error parsing JSON results:', error);
        return null;
    }
}

function findFailedTests(results) {
    const failedTests = [];
    
    function traverseSuites(suites) {
        for (const suite of suites) {
            if (suite.specs) {
                for (const spec of suite.specs) {
                    if (spec.ok === false) {
                        // Extract opco from suite title (e.g., "Authenticated User Workflow - ACE")
                        const opcoMatch = suite.title.match(/- ([A-Z]+)$/);
                        const opco = opcoMatch ? opcoMatch[1].toLowerCase() : 'unknown';
                        
                        // Clean up test name (remove tags)
                        const testName = spec.title.replace(/@\w+/g, '').trim();
                        
                        failedTests.push({
                            testName: testName,
                            opco: opco,
                            status: 'failed',
                            environment: 'stage' // Default, could be enhanced to detect
                        });
                    }
                }
            }
            if (suite.suites) {
                traverseSuites(suite.suites);
            }
        }
    }
    
    if (results.suites) {
        traverseSuites(results.suites);
    }
    
    return failedTests;
}

function cleanTestName(testName) {
  return testName
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase()
    .substring(0, 50); // Limit length
}

function createDescriptiveFolderName(testInfo) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${testInfo.testName}-${testInfo.opco}-${testInfo.environment}-${testInfo.status}-${timestamp}`;
}

// Run the script
if (require.main === module) {
  renameTestResultFolders();
}

module.exports = { renameTestResultFolders }; 