import { test, expect } from '@playwright/test';
import { MultiOpcoTestRunner, createMultiOpcoTestRunner, OpcoTestContext } from '../../utils/multi-opco-test-runner';

/**
 * Multi-Opco E2E Login Tests
 * 
 * These tests demonstrate how to run the same login test logic across multiple opcos.
 * Tests are tagged for selective execution:
 * - @e2e: E2E test category
 * - @login: Login functionality
 * - @multi-opco: Multi-opco test
 * - @env:stage: Environment (stage or production)
 * - @opcos:bge,comed,peco: Specific opcos to test (optional)
 */

test.describe('Multi-Opco E2E Login Tests', () => {
  let multiOpcoRunner: MultiOpcoTestRunner;

  test.beforeEach(async ({ page }) => {
    // Initialize multi-opco test runner
    multiOpcoRunner = createMultiOpcoTestRunner({
      environment: 'stage',
      testCategory: 'login',
      testName: 'multi-opco-login'
    });
  });

  test('should successfully login across all opcos @e2e @login @multi-opco @env:stage', async ({ page }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing login for opco: ${context.opco}`);
      
      // Navigate to the login page for this opco
      await multiOpcoRunner.navigateToSecurePage(context, page, '/accounts/login');
      
      // Verify login page is loaded
      await expect(page).toHaveTitle(/Sign up or sign in/);
      await expect(page.locator('[id="localAccountForm"]')).toBeVisible();
      
      // Fill in credentials for this opco
      await page.fill('[data-di-id="#signInName"]', context.credentials.username);
      await page.fill('[data-di-id="#password"]', context.credentials.password);
      
      // Submit the form
      await page.click('[data-di-id="#next"]');
      
      // Handle MFA if present
      if (await page.waitForSelector('#enable', { timeout: 5000 })) {
        await expect(page.locator("#remindLater > a")).toBeVisible();
        console.log(`Enable MFA prompt active for ${context.opco}, clicking 'Remind Me Later'`);
        await page.click('#remindLater > a');
      } else {
        console.log(`Enable MFA prompt not visible for ${context.opco}, proceeding with login`);
      }
      
      // Wait for successful login
      await page.waitForSelector(
        "body > app-root > app-dashboard > main > app-account-navigation-banner",
        { timeout: 100000 }
      );

      // Verify successful login
      await expect(page).toHaveURL(/dashboard/);
      
      // Take screenshot for verification
      await multiOpcoRunner.takeScreenshot(context, page, 'login-success');
      
      console.log(`Successfully logged in to ${context.opco}`);
    }
  });

  test('should show error message with invalid credentials across all opcos @e2e @login @multi-opco @env:stage', async ({ page }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing invalid login for opco: ${context.opco}`);
      
      // Navigate to the login page for this opco
      await multiOpcoRunner.navigateToSecurePage(context, page, '/accounts/login');
      
      // Fill in invalid credentials
      await page.fill('[data-di-id="#signInName"]', 'invalid_user');
      await page.fill('[data-di-id="#password"]', "invalid_password");
      
      // Submit the form
      await page.click('[data-di-id="#next"]');

      // Verify error message is displayed
      await expect(page.locator("#pageError")).toBeVisible();
      await expect(page.locator("#pageError")).toContainText("Please try again.");
      
      // Take screenshot for verification
      await multiOpcoRunner.takeScreenshot(context, page, 'login-error');
      
      console.log(`Successfully tested invalid login for ${context.opco}`);
    }
  });

  test('should validate required fields across all opcos @e2e @login @multi-opco @env:stage', async ({ page }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing field validation for opco: ${context.opco}`);
      
      // Navigate to the login page for this opco
      await multiOpcoRunner.navigateToSecurePage(context, page, '/accounts/login');
      
      // Focus on password field to trigger validation
      await page.locator('[data-di-id="#password"]').focus();
      
      // Try to submit without filling credentials
      expect(page.locator('[data-di-id="#next"]')).toBeDisabled();
      await page.keyboard.press('Enter');
      
      // Verify validation messages
      await expect(page.locator('[data-di-id="#signInName"]')).toHaveClass(/highlightError/);
      await expect(page.locator('[data-di-id="#password"]')).toHaveClass(/highlightError/);

      // Take screenshot for verification
      await multiOpcoRunner.takeScreenshot(context, page, 'login-validation');
      
      console.log(`Successfully tested field validation for ${context.opco}`);
    }
  });
}); 