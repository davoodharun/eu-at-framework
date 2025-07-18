// import { test, expect } from '@playwright/test';
// import { BaseTest } from '../../../utils/test-base';

// /**
//  * E2E Login Tests
//  * 
//  * These tests verify the login functionality across different opcos and environments.
//  * Tests are tagged for selective execution:
//  * - @e2e: E2E test category
//  * - @login: Login functionality
//  * - @opco:ace: Specific opco (can be changed for different opcos)
//  * - @env:stage: Environment (stage or production)
//  */

// test.describe('E2E Login Tests', () => {
//   let baseTest: BaseTest;

//   test.beforeEach(async ({ page }) => {
//     // Get opco from environment variable or default to 'ace'
//     const opcoList = process.env.OPCO_LIST;
//     let targetOpco = 'ace'; // default
    
//     if (opcoList) {
//       const opcos = opcoList.split(',').map(opco => opco.trim());
//       // Use the first opco in the list, or default to 'ace' if not found
//       targetOpco = opcos.find(opco => ['bge', 'com', 'pec', 'ace', 'dpl', 'pep'].includes(opco)) || 'ace';
//     }
    
//     // Initialize base test with login category
//     baseTest = new BaseTest({
//       opco: targetOpco,
//       environment: 'stage',
//       testCategory: 'login',
//       testName: 'basic-login'
//     });
//   });

//   test('should successfully login with valid credentials @e2e @login @env:stage', async ({ page }) => {
//     // Navigate to the login page
//     await baseTest.navigateToSecurePage(page, '/accounts/login');
    
//     // Verify login page is loaded
//     await expect(page).toHaveTitle(/Sign up or sign in/);
//     await expect(page.locator('[id="localAccountForm"]')).toBeVisible();
    
//     // Fill in credentials
//     await page.fill('[data-di-id="#signInName"]', baseTest['credentials'].username);
//     await page.fill('[data-di-id="#password"]', baseTest['credentials'].password);
    
//     // Submit the form
//     await page.click('[data-di-id="#next"]');
//     if (await page.waitForSelector('#enable', { timeout: 5000 })) {
//       await expect(page.locator("#remindLater > a")).toBeVisible();
//       console.log("Enable MFA prompt active, clicking 'Remind Me Later'");
//       await page.click('#remindLater > a');
//     } else {
//       console.log('Enable MFA prompt not visible, proceeding with login');
//     }
//     // Wait for successful login
//     await page.waitForSelector(
//       "body > app-root > app-dashboard > main > app-account-navigation-banner",
//       { timeout: 100000 }
//     );

//     // Verify successful login
//     // await expect(
//     //   page.locator(
//     //     "body > app-root > app-dashboard > main > app-account-navigation-banner"
//     //   )
//     // ).toBeVisible();
//     await expect(page).toHaveURL(/dashboard/);
    
//     // Take screenshot for verification
//     await baseTest.takeScreenshot(page, 'login-success');
//   });

//   test('should show error message with invalid credentials @e2e @login @env:stage', async ({ page }) => {
//     // Navigate to the login page
//     await baseTest.navigateToSecurePage(page, '/accounts/login');
    
//     // Fill in invalid credentials
//     await page.fill('[data-di-id="#signInName"]', 'invalid_user');
//     await page.fill('[data-di-id="#password"]', "invalid_password");
    
//     // Submit the form
//     await page.click('[data-di-id="#next"]');

//     // Verify error message is displayed
//     await expect(page.locator("#pageError")).toBeVisible();
//     await expect(page.locator("#pageError")).toContainText(
//       "Please try again."
//     );
    
//     // Take screenshot for verification
//     await baseTest.takeScreenshot(page, 'login-error');
//   });

//   test('should validate required fields @e2e @login @env:stage', async ({ page }) => {
//     // Navigate to the login page
//     await baseTest.navigateToSecurePage(page, '/accounts/login');
//     await page.locator('[data-di-id="#password"]').focus();
//     // Try to submit without filling credentials

//     expect(page.locator('[data-di-id="#next"]')).toBeDisabled();
//     await page.keyboard.press('Enter');

    
//     // Verify validation messages

//     await expect(page.locator('[data-di-id="#signInName"]')).toHaveClass(
//       /highlightError/
//     );
//     await expect(page.locator('[data-di-id="#password"]')).toHaveClass(
//       /highlightError/
//     );

//     // Take screenshot for verification
//     await baseTest.takeScreenshot(page, 'login-validation');
//   });

//   // test('should logout successfully @e2e @login @opco:ace @env:stage', async ({ page }) => {
//   //   // First login
//   //   await baseTest.login(page);
    
//   //   // Verify we're logged in
//   //   await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
//   //   // Perform logout
//   //   await baseTest.logout(page);
    
//   //   // Verify logout was successful
//   //   await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
//   //   await expect(page).toHaveURL(/login/);
    
//   //   // Take screenshot for verification
//   //   await baseTest.takeScreenshot(page, 'logout-success');
//   // });
// }); 