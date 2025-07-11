import { test, expect } from '@playwright/test';
import { BaseTest } from '../../../utils/test-base';

/**
 * E2E Login Tests
 * 
 * These tests verify the login functionality across different opcos and environments.
 * Tests are tagged for selective execution:
 * - @e2e: E2E test category
 * - @login: Login functionality
 * - @opco:bge: Specific opco (can be changed for different opcos)
 * - @env:stage: Environment (stage or production)
 */

test.describe('E2E Login Tests', () => {
  let baseTest: BaseTest;

  test.beforeEach(async ({ page }) => {
    // Initialize base test with login category
    baseTest = new BaseTest({
      opco: 'bge',
      environment: 'stage',
      testCategory: 'login',
      testName: 'basic-login'
    });
  });

  test('should successfully login with valid credentials @e2e @login @opco:bge @env:stage', async ({ page }) => {
    // Navigate to the login page
    await baseTest.navigateToPage(page, '/login');
    
    // Verify login page is loaded
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    
    // Fill in credentials
    await page.fill('[data-testid="username"]', baseTest['credentials'].username);
    await page.fill('[data-testid="password"]', baseTest['credentials'].password);
    
    // Submit the form
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
    
    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page).toHaveURL(/dashboard/);
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'login-success');
  });

  test('should show error message with invalid credentials @e2e @login @opco:bge @env:stage', async ({ page }) => {
    // Navigate to the login page
    await baseTest.navigateToPage(page, '/login');
    
    // Fill in invalid credentials
    await page.fill('[data-testid="username"]', 'invalid_user');
    await page.fill('[data-testid="password"]', 'invalid_password');
    
    // Submit the form
    await page.click('[data-testid="login-button"]');
    
    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'login-error');
  });

  test('should validate required fields @e2e @login @opco:bge @env:stage', async ({ page }) => {
    // Navigate to the login page
    await baseTest.navigateToPage(page, '/login');
    
    // Try to submit without filling credentials
    await page.click('[data-testid="login-button"]');
    
    // Verify validation messages
    await expect(page.locator('[data-testid="username-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'login-validation');
  });

  test('should logout successfully @e2e @login @opco:bge @env:stage', async ({ page }) => {
    // First login
    await baseTest.login(page);
    
    // Verify we're logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Perform logout
    await baseTest.logout(page);
    
    // Verify logout was successful
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page).toHaveURL(/login/);
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'logout-success');
  });
}); 