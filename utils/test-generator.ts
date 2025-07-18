import { test, expect, Page } from '@playwright/test';
import { getAllOpcos, OpcoConfig } from '../config/environments';
import { getTestCredentials, TestCredentials } from '../config/credentials';

/**
 * Test Generator for Multi-Opco Testing
 * 
 * This utility generates test instances for each opco based on environment variables.
 * Tests are created dynamically based on OPCO_LIST or OPCO_SKIP environment variables.
 */

export interface TestGeneratorOptions {
  environment: 'stage' | 'production';
  testCategory: string;
  testName?: string;
  opcos?: string[]; // Specific opcos to run this test for
}

export interface OpcoTestContext {
  opco: string;
  opcoConfig: OpcoConfig;
  credentials: TestCredentials;
  baseUrl: string;
  secureBaseUrl: string;
}

/**
 * Get the list of opcos to test based on environment variables
 * Priority: OPCO_LIST > OPCO_SKIP > all opcos
 */
function getOpcosToTest(environment: 'stage' | 'production'): OpcoConfig[] {
  const allOpcos = getAllOpcos(environment);
  
  // Check if specific opcos are requested via OPCO_LIST
  const opcoList = process.env.OPCO_LIST;
  if (opcoList) {
    const requestedOpcos = opcoList.split(',').map(opco => opco.trim());
    return allOpcos.filter(opco => requestedOpcos.includes(opco.name));
  }
  
  // Check if opcos should be skipped via OPCO_SKIP
  const opcoSkip = process.env.OPCO_SKIP;
  if (opcoSkip) {
    const skipOpcos = opcoSkip.split(',').map(opco => opco.trim());
    return allOpcos.filter(opco => !skipOpcos.includes(opco.name));
  }
  
  // Default: return all opcos
  return allOpcos;
}

/**
 * Get opcos for a specific test based on options and environment variables
 */
function getOpcosForTest(environment: 'stage' | 'production', options: TestGeneratorOptions): OpcoConfig[] {
  const allOpcos = getAllOpcos(environment);
  
  // If specific opcos are specified in options, use those
  if (options.opcos && options.opcos.length > 0) {
    return allOpcos.filter(opco => options.opcos!.includes(opco.name));
  }
  
  // Otherwise, use the environment variable logic
  return getOpcosToTest(environment);
}

/**
 * Create test context for a specific opco
 */
function createOpcoTestContext(
  opco: OpcoConfig, 
  environment: 'stage' | 'production',
  testCategory: string,
  testName?: string
): OpcoTestContext {
  const credentials = getTestCredentials(
    opco.name,
    environment,
    testCategory,
    testName
  );

  return {
    opco: opco.name,
    opcoConfig: opco,
    credentials,
    baseUrl: opco.anonUrl,
    secureBaseUrl: opco.secureUrl
  };
}

/**
 * Generate a test that runs for each opco specified in environment variables
 */
export function generateOpcoTest(
  testName: string,
  testFunction: (context: OpcoTestContext, page: Page) => Promise<void>,
  options: TestGeneratorOptions
) {
  const opcosToTest = getOpcosForTest(options.environment, options);

  // Create a test for each opco
  opcosToTest.forEach(opco => {
    test(`${testName} - ${opco.name.toUpperCase()} @e2e @multi-opco @env:${options.environment}`, async ({ page }) => {
      console.log(`Running test for opco: ${opco.name}`);
      
      try {
        // Create context lazily to avoid credential errors at module load time
        const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
        await testFunction(context, page);
        console.log(`Successfully completed test for ${context.opco}`);
      } catch (error) {
        console.error(`Test failed for opco ${opco.name}:`, error);
        throw error;
      }
    });
  });
}

/**
 * Generate a test that runs for specific opcos only
 */
export function generateOpcoSpecificTest(
  testName: string,
  testFunction: (context: OpcoTestContext, page: Page) => Promise<void>,
  options: TestGeneratorOptions & { opcos: string[] }
) {
  const opcosToTest = getOpcosForTest(options.environment, options);

  // Create a test for each specified opco
  opcosToTest.forEach(opco => {
    test(`${testName} - ${opco.name.toUpperCase()} @e2e @multi-opco @env:${options.environment} @opco:${opco.name}`, async ({ page }) => {
      console.log(`Running opco-specific test for opco: ${opco.name}`);
      
      try {
        // Create context lazily to avoid credential errors at module load time
        const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
        await testFunction(context, page);
        console.log(`Successfully completed opco-specific test for ${context.opco}`);
      } catch (error) {
        console.error(`Opco-specific test failed for opco ${opco.name}:`, error);
        throw error;
      }
    });
  });
}

/**
 * Generate a test that runs for all opcos (explicitly)
 */
export function generateAllOpcosTest(
  testName: string,
  testFunction: (context: OpcoTestContext, page: Page) => Promise<void>,
  options: TestGeneratorOptions
) {
  const allOpcos = getAllOpcos(options.environment);
  const opcosToTest = getOpcosForTest(options.environment, { ...options, opcos: allOpcos.map(opco => opco.name) });

  // Create a test for each opco
  opcosToTest.forEach(opco => {
    test(`${testName} - ${opco.name.toUpperCase()} @e2e @multi-opco @env:${options.environment} @all-opcos`, async ({ page }) => {
      console.log(`Running all-opcos test for opco: ${opco.name}`);
      
      try {
        // Create context lazily to avoid credential errors at module load time
        const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
        await testFunction(context, page);
        console.log(`Successfully completed all-opcos test for ${context.opco}`);
      } catch (error) {
        console.error(`All-opcos test failed for opco ${opco.name}:`, error);
        throw error;
      }
    });
  });
}

/**
 * Generate an API test that runs for each opco specified in environment variables
 */
export function generateOpcoAPITest(
  testName: string,
  testFunction: (context: OpcoTestContext, request: any) => Promise<void>,
  options: TestGeneratorOptions
) {
  const opcosToTest = getOpcosForTest(options.environment, options);

  // Create a test for each opco
  opcosToTest.forEach(opco => {
    test(`${testName} - ${opco.name.toUpperCase()} @integration @api @multi-opco @env:${options.environment}`, async ({ request }) => {
      console.log(`Running API test for opco: ${opco.name}`);
      
      try {
        // Create context lazily to avoid credential errors at module load time
        const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
        await testFunction(context, request);
        console.log(`Successfully completed API test for ${context.opco}`);
      } catch (error) {
        console.error(`API test failed for opco ${opco.name}:`, error);
        throw error;
      }
    });
  });
}

/**
 * Generate an API test that runs for specific opcos only
 */
export function generateOpcoSpecificAPITest(
  testName: string,
  testFunction: (context: OpcoTestContext, request: any) => Promise<void>,
  options: TestGeneratorOptions & { opcos: string[] }
) {
  const opcosToTest = getOpcosForTest(options.environment, options);

  // Create a test for each specified opco
  opcosToTest.forEach(opco => {
    test(`${testName} - ${opco.name.toUpperCase()} @integration @api @multi-opco @env:${options.environment} @opco:${opco.name}`, async ({ request }) => {
      console.log(`Running opco-specific API test for opco: ${opco.name}`);
      
      try {
        // Create context lazily to avoid credential errors at module load time
        const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
        await testFunction(context, request);
        console.log(`Successfully completed opco-specific API test for ${context.opco}`);
      } catch (error) {
        console.error(`Opco-specific API test failed for opco ${opco.name}:`, error);
        throw error;
      }
    });
  });
}

/**
 * Generate an API test that runs for all opcos (explicitly)
 */
export function generateAllOpcosAPITest(
  testName: string,
  testFunction: (context: OpcoTestContext, request: any) => Promise<void>,
  options: TestGeneratorOptions
) {
  const allOpcos = getAllOpcos(options.environment);
  const opcosToTest = getOpcosForTest(options.environment, { ...options, opcos: allOpcos.map(opco => opco.name) });

  // Create a test for each opco
  opcosToTest.forEach(opco => {
    test(`${testName} - ${opco.name.toUpperCase()} @integration @api @multi-opco @env:${options.environment} @all-opcos`, async ({ request }) => {
      console.log(`Running all-opcos API test for opco: ${opco.name}`);
      
      try {
        // Create context lazily to avoid credential errors at module load time
        const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
        await testFunction(context, request);
        console.log(`Successfully completed all-opcos API test for ${context.opco}`);
      } catch (error) {
        console.error(`All-opcos API test failed for opco ${opco.name}:`, error);
        throw error;
      }
    });
  });
}

/**
 * Generate a test suite with multiple tests for each opco
 */
export function generateOpcoTestSuite(
  suiteName: string,
  tests: Array<{
    name: string;
    function: (context: OpcoTestContext, page: Page) => Promise<void>;
  }>,
  options: TestGeneratorOptions
) {
  const opcosToTest = getOpcosForTest(options.environment, options);

  // Create a test suite for each opco
  opcosToTest.forEach(opco => {
    test.describe(`${suiteName} - ${opco.name.toUpperCase()}`, () => {
      tests.forEach(({ name, function: testFunction }) => {
        test(`${name} @e2e @multi-opco @env:${options.environment}`, async ({ page }) => {
          console.log(`Running ${name} for opco: ${opco.name}`);
          
          try {
            // Create context lazily to avoid credential errors at module load time
            const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
            await testFunction(context, page);
            console.log(`Successfully completed ${name} for ${context.opco}`);
          } catch (error) {
            console.error(`${name} failed for opco ${opco.name}:`, error);
            throw error;
          }
        });
      });
    });
  });
}

/**
 * Generate an API test suite with multiple tests for each opco
 */
export function generateOpcoAPITestSuite(
  suiteName: string,
  tests: Array<{
    name: string;
    function: (context: OpcoTestContext, request: any) => Promise<void>;
  }>,
  options: TestGeneratorOptions
) {
  const opcosToTest = getOpcosForTest(options.environment, options);

  // Create a test suite for each opco
  opcosToTest.forEach(opco => {
    test.describe(`${suiteName} - ${opco.name.toUpperCase()}`, () => {
      tests.forEach(({ name, function: testFunction }) => {
        test(`${name} @integration @api @multi-opco @env:${options.environment}`, async ({ request }) => {
          console.log(`Running API ${name} for opco: ${opco.name}`);
          
          try {
            // Create context lazily to avoid credential errors at module load time
            const context = createOpcoTestContext(opco, options.environment, options.testCategory, options.testName);
            await testFunction(context, request);
            console.log(`Successfully completed API ${name} for ${context.opco}`);
          } catch (error) {
            console.error(`API ${name} failed for opco ${opco.name}:`, error);
            throw error;
          }
        });
      });
    });
  });
}

/**
 * Helper function to get current opco list for debugging
 */
export function getCurrentOpcoList(): string[] {
  const opcoList = process.env.OPCO_LIST;
  const opcoSkip = process.env.OPCO_SKIP;
  
  if (opcoList) {
    return opcoList.split(',').map(opco => opco.trim());
  }
  
  if (opcoSkip) {
    const skipOpcos = opcoSkip.split(',').map(opco => opco.trim());
    const allOpcos = ['bge', 'com', 'pec', 'ace', 'dpl', 'pep'];
    return allOpcos.filter(opco => !skipOpcos.includes(opco));
  }
  
  return ['bge', 'com', 'pec', 'ace', 'dpl', 'pep'];
} 