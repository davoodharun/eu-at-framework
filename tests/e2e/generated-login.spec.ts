// import { expect } from '@playwright/test';
// import { generateOpcoTest, TestGeneratorOptions, OpcoTestContext } from '../../utils/test-generator';

// /**
//  * Generated Login Tests
//  * 
//  * These tests are dynamically generated based on the OPCO_LIST environment variable.
//  * Run with: npm run test:login:bge or npm run test:login:stage
//  */

// // Test 1: Successful login
// generateOpcoTest(
//   'should successfully login with valid credentials',
//   async (context: OpcoTestContext, page) => {
//     // Navigate to the login page for this opco
//     await page.goto(`${context.secureBaseUrl}/accounts/login`);
    
//     // Verify login page is loaded
//     await expect(page).toHaveTitle(/Sign up or sign in/);
//     await expect(page.locator('[id="localAccountForm"]')).toBeVisible();
    
//     // Fill in credentials for this opco
//     await page.fill('[data-di-id="#signInName"]', context.credentials.username);
//     await page.fill('[data-di-id="#password"]', context.credentials.password);
    
//     // Submit the form
//     await page.click('[data-di-id="#next"]');
    
//     // Handle MFA if present
//     if (await page.waitForSelector('#enable', { timeout: 5000 })) {
//       await expect(page.locator("#remindLater > a")).toBeVisible();
//       console.log(`Enable MFA prompt active for ${context.opco}, clicking 'Remind Me Later'`);
//       await page.click('#remindLater > a');
//     } else {
//       console.log(`Enable MFA prompt not visible for ${context.opco}, proceeding with login`);
//     }
    
//     // Wait for successful login
//     await page.waitForSelector(
//       "body > app-root > app-dashboard > main > app-account-navigation-banner",
//       { timeout: 100000 }
//     );

//     // Verify successful login
//     await expect(page).toHaveURL(/dashboard/);
    
//     // Take screenshot for verification
//     await page.screenshot({
//       path: `test-results/screenshots/${context.opco}_login_success.png`,
//       fullPage: true,
//     });
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login'
//   }
// );

// // Test 2: Invalid credentials
// generateOpcoTest(
//   'should show error message with invalid credentials',
//   async (context: OpcoTestContext, page) => {
//     // Navigate to the login page for this opco
//     await page.goto(`${context.secureBaseUrl}/accounts/login`);
    
//     // Fill in invalid credentials
//     await page.fill('[data-di-id="#signInName"]', 'invalid_user');
//     await page.fill('[data-di-id="#password"]', "invalid_password");
    
//     // Submit the form
//     await page.click('[data-di-id="#next"]');

//     // Verify error message is displayed
//     await expect(page.locator("#pageError")).toBeVisible();
//     await expect(page.locator("#pageError")).toContainText("Please try again.");
    
//     // Take screenshot for verification
//     await page.screenshot({
//       path: `test-results/screenshots/${context.opco}_login_error.png`,
//       fullPage: true,
//     });
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login'
//   }
// );

// // Test 3: Field validation
// generateOpcoTest(
//   'should validate required fields',
//   async (context: OpcoTestContext, page) => {
//     // Navigate to the login page for this opco
//     await page.goto(`${context.secureBaseUrl}/accounts/login`);
    
//     // Focus on password field to trigger validation
//     await page.locator('[data-di-id="#password"]').focus();
    
//     // Try to submit without filling credentials
//     expect(page.locator('[data-di-id="#next"]')).toBeDisabled();
//     await page.keyboard.press('Enter');
    
//     // Verify validation messages
//     await expect(page.locator('[data-di-id="#signInName"]')).toHaveClass(/highlightError/);
//     await expect(page.locator('[data-di-id="#password"]')).toHaveClass(/highlightError/);

//     // Take screenshot for verification
//     await page.screenshot({
//       path: `test-results/screenshots/${context.opco}_login_validation.png`,
//       fullPage: true,
//     });
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login'
//   }
// ); 