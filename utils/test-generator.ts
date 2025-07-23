import { test, expect, Page } from '@playwright/test';
import { getAllOpcos, OpcoConfig } from '../config/environments';
import { getTestCredentials, TestCredentials } from '../config/credentials';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test Generator for Multi-Opco Testing
 * 
 * This utility generates test instances for each opco based on environment variables.
 * Tests are created dynamically based on OPCO_LIST or OPCO_SKIP environment variables.
 */

export interface TestGeneratorOptions {
  environment?: 'stage' | 'production' | ('stage' | 'production')[]; // If not specified, runs in both environments
  credentialId: string; // Used to select credentials for the test
  testName?: string;
  opcos?: string[]; // If not specified, uses OPCO_LIST/OPCO_SKIP logic
  requiresLogin?: boolean; // Whether this test requires a logged-in state
  useSharedLogin?: boolean; // Whether to use shared login state from previous test
}

export interface OpcoTestContext {
  opco: string;
  opcoConfig: OpcoConfig;
  credentials: TestCredentials;
  baseUrl: string;
  secureBaseUrl: string;
}

// Storage state file directory
const STORAGE_STATE_DIR = path.join(process.cwd(), 'test-results', 'storage-states');

/**
 * Ensure storage state directory exists
 */
function ensureStorageStateDir(): void {
  if (!fs.existsSync(STORAGE_STATE_DIR)) {
    fs.mkdirSync(STORAGE_STATE_DIR, { recursive: true });
  }
}

/**
 * Get storage state file path for a specific opco and environment
 */
function getStorageStatePath(opco: string, environment: string): string {
  return path.join(STORAGE_STATE_DIR, `${opco}-${environment}-storage-state.json`);
}

/**
 * Helper function to perform login and store state for reuse
 */
export async function performLoginAndStoreState(
  context: OpcoTestContext, 
  page: Page
): Promise<void> {
  const stateFilePath = getStorageStatePath(context.opco, process.env.TEST_ENVIRONMENT || 'stage');
  
  // Check if we already have stored login state
  if (fs.existsSync(stateFilePath)) {
    
    try {
      // Load the stored state by reading the file and applying it
      const storageState = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      
      // Apply cookies
      if (storageState.cookies && Array.isArray(storageState.cookies)) {
        await page.context().addCookies(storageState.cookies);
      }
      
      // Navigate to a page that requires authentication to verify login state
      try {
        await page.goto(context.secureBaseUrl, { timeout: 20000 });
        
        // Wait for the page to load completely - use domcontentloaded instead of networkidle to avoid timeouts
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      } catch (navigationError) {
        console.log(`Navigation failed for ${context.opco}: ${navigationError instanceof Error ? navigationError.message : String(navigationError)}`);
        // If navigation fails, remove the storage state and continue with fresh login
        if (fs.existsSync(stateFilePath)) {
          fs.unlinkSync(stateFilePath);
        }
        throw navigationError;
      }
      
      // Apply storage state after page has loaded
      if (storageState.origins && Array.isArray(storageState.origins)) {
        for (const origin of storageState.origins) {
          if (origin.localStorage && Array.isArray(origin.localStorage)) {
            try {
              await page.evaluate((originData) => {
                for (const item of originData.localStorage) {
                  if (item.name && item.value !== undefined) {
                    localStorage.setItem(item.name, item.value);
                  }
                }
              }, origin);
            } catch (storageError) {
              console.log(`Failed to apply localStorage for ${context.opco}: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
            }
          }
        }
      }
      
      // Storage state has been applied, consider it successful
      return;
    } catch (error) {
      console.log(`Failed to load stored login state for ${context.opco}: ${error instanceof Error ? error.message : String(error)}`);
      // If loading fails, remove the file and continue with fresh login
      if (fs.existsSync(stateFilePath)) {
        fs.unlinkSync(stateFilePath);
      }
    }
  }

  // Perform fresh login
  await page.goto(context.secureBaseUrl + '/accounts/login');
  
  // Check if we're already logged in (might happen if storage state was partially loaded)
  try {
    await page.waitForSelector('button[aria-label="Sign Out"]', { timeout: 3000 });
    
    // Ensure we are on the correct domain before saving storage
    const url = page.url();
    if (!url.startsWith(context.secureBaseUrl)) {
      await page.goto(context.secureBaseUrl);
    }
    
    // Store the login state for future tests
    ensureStorageStateDir();
    await page.context().storageState({ path: stateFilePath });
    return;
      } catch (error) {
      // Check if we're on the login page or if we got redirected to a logged-in page
      const currentUrl = page.url();
      
      // Wait for page to be ready before checking title
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        const pageTitle = await page.title();
        
        if (pageTitle.includes('Accounts') || currentUrl.includes('/accounts/dashboard')) {
          // Store the login state for future tests
          ensureStorageStateDir();
          await page.context().storageState({ path: stateFilePath });
          return;
        }
      } catch (titleError) {
        // If we can't get the title, check URL only
        if (currentUrl.includes('/accounts/dashboard')) {
          // Store the login state for future tests
          ensureStorageStateDir();
          await page.context().storageState({ path: stateFilePath });
          return;
        }
      }
      
      // Not logged in, continue with login process
    }
  
  // Verify login page is loaded
  await expect(page).toHaveTitle(/Sign up or sign in/);
  await page.waitForSelector('[id="localAccountForm"]', { timeout: 30000 });
  await page.waitForSelector('[aria-label="Email or Username"]', { timeout: 30000 });
  await page.waitForSelector('[aria-label="Password"]', { timeout: 30000 });
  await expect(page.locator('[id="localAccountForm"]')).toBeVisible();
  
  // Fill in credentials - wait for form to be ready
  await page.waitForSelector('[aria-label="Email or Username"]:not([disabled])', { timeout: 30000 });
  
  // Clear the field first, then fill it
  await page.click('[aria-label="Email or Username"]');
  await page.fill('[aria-label="Email or Username"]', '', { timeout: 30000 });
  await page.fill('[aria-label="Email or Username"]', context.credentials.username, { timeout: 30000 });
  
  // Verify the field was filled correctly
  const filledValue = await page.inputValue('[aria-label="Email or Username"]');
  if (filledValue !== context.credentials.username) {
    console.log(`Username field not filled correctly. Expected: ${context.credentials.username}, Got: ${filledValue}`);
    // Try filling again
    await page.fill('[aria-label="Email or Username"]', context.credentials.username, { timeout: 70000 });
    const retryValue = await page.inputValue('[aria-label="Email or Username"]');
    if (retryValue !== context.credentials.username) {
      throw new Error(`Username field not filled correctly after retry. Expected: ${context.credentials.username}, Got: ${retryValue}`);
    }
  }
  
  await page.waitForSelector('[aria-label="Password"]', { timeout: 70000 });
  await page.fill('[aria-label="Password"]', context.credentials.password, { timeout: 70000 } );
  
  // Submit the form
  await expect(page.locator('[data-di-id="#next"]')).toBeVisible({ timeout: 70000 });
  await page.click('[data-di-id="#next"]', { timeout: 30000 });
  
  // Wait for the login response - using a more flexible URL pattern
  const responsePromise = page.waitForResponse(response => 
    response.url().includes("stage-secure.exeloncorp.com/euazurephistage.onmicrosoft.com") && 
    response.url().includes("SelfAsserted") &&
    response.status() === 200 &&
    response.request().method() === 'POST', { timeout: 30000 }
  );  
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  
  if (await page.waitForSelector('#enable', { timeout: 5000 })) {
    await expect(page.locator("#remindLater > a")).toBeVisible();
    await page.click('#remindLater > a');
  }

  // Wait for a user-specific element that indicates login is complete
  await page.waitForSelector('button[aria-label="Sign Out"]', { timeout: 30000 });

  // Ensure we are on the correct domain before saving storage
  const url = page.url();
  if (!url.startsWith(context.secureBaseUrl)) {
    throw new Error(`Not on expected domain for storage save: ${url}`);
  }

  // Store the login state for future tests
  ensureStorageStateDir();
  await page.context().storageState({ path: stateFilePath });
}

/**
 * Helper function to ensure user is logged in (uses stored state if available)
 */
export async function ensureLoggedIn(
  context: OpcoTestContext, 
  page: Page
): Promise<void> {
  await performLoginAndStoreState(context, page);
}

/**
 * Helper function to clear stored login state (useful for cleanup)
 */
export function clearStoredLoginState(opco?: string): void {
  ensureStorageStateDir();
  
  if (opco) {
    // Clear state for specific opco
    const environment = process.env.TEST_ENVIRONMENT || 'stage';
    const stateFilePath = getStorageStatePath(opco, environment);
    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
      console.log(`Cleared stored login state for ${opco}`);
    }
  } else {
    // Clear all stored state files
    const files = fs.readdirSync(STORAGE_STATE_DIR);
    files.forEach(file => {
      if (file.endsWith('-storage-state.json')) {
        fs.unlinkSync(path.join(STORAGE_STATE_DIR, file));
      }
    });
    console.log('Cleared all stored login state files');
  }
}

/**
 * Helper function to clear all stored login states before test run
 * This should be called at the beginning of test suites that use shared login
 */
export function clearAllStoredLoginStates(): void {
  clearStoredLoginState();
}

/**
 * Get the target environments for a test based on options and environment variables
 */
function getTargetEnvironments(options: TestGeneratorOptions): ('stage' | 'production')[] {
  // If specific environments are specified in options, use those
  if (options.environment) {
    if (Array.isArray(options.environment)) {
      return options.environment;
    } else {
      return [options.environment];
    }
  }
  
  // Check if environment is specified via environment variable
  const envFromVar = process.env.TEST_ENVIRONMENT;
  if (envFromVar === 'stage' || envFromVar === 'production') {
    return [envFromVar];
  }
  
  // Default: return both environments
  return ['stage', 'production'];
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
  credentialId: string,
  testName?: string
): OpcoTestContext {
  const credentials = getTestCredentials(
    opco.name,
    environment,
    credentialId,
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
 * Generate a test that runs for specified environments and opcos
 */
export function generateOpcoTest(
  testName: string,
  testFunction: (context: OpcoTestContext, page: Page) => Promise<void>,
  options: TestGeneratorOptions
) {
  const targetEnvironments = getTargetEnvironments(options);

  // Create a test for each environment and opco combination
  targetEnvironments.forEach(environment => {
    const opcosToTest = getOpcosForTest(environment, options);

    opcosToTest.forEach(opco => {
      test(`${testName} - ${opco.name.toUpperCase()} @e2e @multi-opco @env:${environment}`, async ({ page }) => {
        console.log(`Running test for opco: ${opco.name} in environment: ${environment}`);
        
        try {
          // Create context lazily to avoid credential errors at module load time
          const context = createOpcoTestContext(opco, environment, options.credentialId, options.testName);
          
          // Handle login requirements
          if (options.requiresLogin || options.useSharedLogin) {
            await ensureLoggedIn(context, page);
          }
          
          await testFunction(context, page);
          console.log(`Successfully completed test for ${context.opco} in ${environment}`);
        } catch (error) {
          console.error(`Test failed for opco ${opco.name} in ${environment}:`, error);
          throw error;
        }
      });
    });
  });
}

/**
 * Generate an API test that runs for specified environments and opcos
 */
export function generateOpcoAPITest(
  testName: string,
  testFunction: (context: OpcoTestContext, request: any) => Promise<void>,
  options: TestGeneratorOptions
) {
  const targetEnvironments = getTargetEnvironments(options);

  // Create a test for each environment and opco combination
  targetEnvironments.forEach(environment => {
    const opcosToTest = getOpcosForTest(environment, options);

    opcosToTest.forEach(opco => {
      test(`${testName} - ${opco.name.toUpperCase()} @integration @api @multi-opco @env:${environment}`, async ({ request }) => {
        console.log(`Running API test for opco: ${opco.name} in environment: ${environment}`);
        
        try {
          // Create context lazily to avoid credential errors at module load time
          const context = createOpcoTestContext(opco, environment, options.credentialId, options.testName);
          await testFunction(context, request);
          console.log(`Successfully completed API test for ${context.opco} in ${environment}`);
        } catch (error) {
          console.error(`API test failed for opco ${opco.name} in ${environment}:`, error);
          throw error;
        }
      });
    });
  });
}

/**
 * Generate a test suite with multiple tests for specified environments and opcos
 */
export function generateOpcoTestSuite(
  suiteName: string,
  tests: Array<{
    name: string;
    function: (context: OpcoTestContext, page: Page) => Promise<void>;
  }>,
  options: TestGeneratorOptions
) {
  // Register global cleanup
  registerGlobalCleanup();
  
  const targetEnvironments = getTargetEnvironments(options);

  // Create a test suite for each environment and opco combination
  targetEnvironments.forEach(environment => {
    const opcosToTest = getOpcosForTest(environment, options);

    opcosToTest.forEach(opco => {
      // Create the shared context once for this opco
      const sharedContext = createOpcoTestContext(opco, environment, options.credentialId, options.testName);
      
      // Create a single test suite for this opco with all tests - run tests sequentially to share login state
      test.describe.serial(`${suiteName} - ${opco.name.toUpperCase()}`, () => {
        // Create all tests for this opco
        tests.forEach(({ name, function: testFunction }) => {
          test(`${name} @e2e @multi-opco @env:${environment}`, async ({ page }) => {
            console.log(`Running ${name} for opco: ${opco.name} in environment: ${environment}`);
            
            try {
              // Handle login requirements - this will use shared state if available
              if (options.requiresLogin || options.useSharedLogin) {
                await ensureLoggedIn(sharedContext, page);
              }
              
              await testFunction(sharedContext, page);
              console.log(`Successfully completed ${name} for ${sharedContext.opco} in ${environment}`);
            } catch (error) {
              console.error(`${name} failed for opco ${opco.name} in ${environment}:`, error);
              throw error;
            }
          });
        });
      });
    });
  });
}

/**
 * Generate an API test suite with multiple tests for specified environments and opcos
 */
export function generateOpcoAPITestSuite(
  suiteName: string,
  tests: Array<{
    name: string;
    function: (context: OpcoTestContext, request: any) => Promise<void>;
  }>,
  options: TestGeneratorOptions
) {
  const targetEnvironments = getTargetEnvironments(options);

  // Create a test suite for each environment and opco combination
  targetEnvironments.forEach(environment => {
    const opcosToTest = getOpcosForTest(environment, options);

    opcosToTest.forEach(opco => {
      test.describe(`${suiteName} - ${opco.name.toUpperCase()}`, () => {
        tests.forEach(({ name, function: testFunction }) => {
          test(`${name} @integration @api @multi-opco @env:${environment}`, async ({ request }) => {
            console.log(`Running API ${name} for opco: ${opco.name} in environment: ${environment}`);
            
            try {
              // Create context lazily to avoid credential errors at module load time
              const context = createOpcoTestContext(opco, environment, options.credentialId, options.testName);
              await testFunction(context, request);
              console.log(`Successfully completed API ${name} for ${context.opco} in ${environment}`);
            } catch (error) {
              console.error(`API ${name} failed for opco ${opco.name} in ${environment}:`, error);
              throw error;
            }
          });
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

// Global cleanup - only runs once at the very end
let globalCleanupRegistered = false;

/**
 * Register global cleanup for storage states
 */
function registerGlobalCleanup(): void {
  if (!globalCleanupRegistered) {
    test.afterAll(async () => {
      console.log('Cleaning up storage states after test completion...');
      clearAllStoredLoginStates();
      console.log('Storage states cleanup completed.');
    });
    globalCleanupRegistered = true;
  }
} 