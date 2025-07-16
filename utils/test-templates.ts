import { test, expect, Page } from '@playwright/test';
import { MultiOpcoTestRunner, createMultiOpcoTestRunner, OpcoTestContext } from './multi-opco-test-runner';

/**
 * Test Templates for Multi-Opco Testing
 * 
 * These templates provide consistent patterns for creating multi-opco tests.
 * They help ensure all tests follow the same structure and conventions.
 */

export interface TestTemplateOptions {
  environment: 'stage' | 'production';
  testCategory: string;
  testName?: string;
  opcos?: string[];
  skipOpcos?: string[];
}

/**
 * Template for E2E tests that run across multiple opcos
 */
export function createE2ETestTemplate(
  testName: string,
  testFunction: (context: OpcoTestContext, page: Page) => Promise<void>,
  options: TestTemplateOptions
) {
  return test(testName, async ({ page }) => {
    const multiOpcoRunner = createMultiOpcoTestRunner({
      environment: options.environment,
      testCategory: options.testCategory,
      testName: options.testName,
      opcos: options.opcos,
      skipOpcos: options.skipOpcos
    });

    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Running E2E test for opco: ${context.opco}`);
      
      try {
        await testFunction(context, page);
        console.log(`Successfully completed E2E test for ${context.opco}`);
      } catch (error) {
        console.error(`E2E test failed for opco ${context.opco}:`, error);
        throw error;
      }
    }
  });
}

/**
 * Template for API tests that run across multiple opcos
 */
export function createAPITestTemplate(
  testName: string,
  testFunction: (context: OpcoTestContext, request: any) => Promise<void>,
  options: TestTemplateOptions
) {
  return test(testName, async ({ request }) => {
    const multiOpcoRunner = createMultiOpcoTestRunner({
      environment: options.environment,
      testCategory: options.testCategory,
      testName: options.testName,
      opcos: options.opcos,
      skipOpcos: options.skipOpcos
    });

    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Running API test for opco: ${context.opco}`);
      
      try {
        await testFunction(context, request);
        console.log(`Successfully completed API test for ${context.opco}`);
      } catch (error) {
        console.error(`API test failed for opco ${context.opco}:`, error);
        throw error;
      }
    }
  });
}

/**
 * Helper function to create a test suite with multiple tests
 */
export function createTestSuite(
  suiteName: string,
  tests: Array<{
    name: string;
    function: (context: OpcoTestContext, page: Page) => Promise<void>;
  }>,
  options: TestTemplateOptions
) {
  return test.describe(suiteName, () => {
    tests.forEach(({ name, function: testFunction }) => {
      createE2ETestTemplate(name, testFunction, options);
    });
  });
}

/**
 * Helper function to create an API test suite
 */
export function createAPITestSuite(
  suiteName: string,
  tests: Array<{
    name: string;
    function: (context: OpcoTestContext, request: any) => Promise<void>;
  }>,
  options: TestTemplateOptions
) {
  return test.describe(suiteName, () => {
    tests.forEach(({ name, function: testFunction }) => {
      createAPITestTemplate(name, testFunction, options);
    });
  });
}

/**
 * Common test patterns that can be reused
 */
export const CommonTestPatterns = {
  /**
   * Login pattern for E2E tests
   */
  login: async (context: OpcoTestContext, page: Page) => {
    const multiOpcoRunner = createMultiOpcoTestRunner({
      environment: context.opcoConfig.name.includes('stage') ? 'stage' : 'production',
      testCategory: 'login'
    });

    await multiOpcoRunner.navigateToSecurePage(context, page, '/accounts/login');
    
    await expect(page).toHaveTitle(/Sign up or sign in/);
    await expect(page.locator('[id="localAccountForm"]')).toBeVisible();
    
    await page.fill('[data-di-id="#signInName"]', context.credentials.username);
    await page.fill('[data-di-id="#password"]', context.credentials.password);
    
    await page.click('[data-di-id="#next"]');
    
    // Handle MFA if present
    if (await page.waitForSelector('#enable', { timeout: 5000 })) {
      await expect(page.locator("#remindLater > a")).toBeVisible();
      await page.click('#remindLater > a');
    }
    
    await page.waitForSelector(
      "body > app-root > app-dashboard > main > app-account-navigation-banner",
      { timeout: 100000 }
    );
    
    await expect(page).toHaveURL(/dashboard/);
  },

  /**
   * API authentication pattern
   */
  apiAuth: async (context: OpcoTestContext, request: any) => {
    const response = await request.post(`${context.baseUrl}/api/auth/login`, {
      data: {
        username: context.credentials.username,
        password: context.credentials.password
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');
    
    return responseBody.token;
  }
}; 