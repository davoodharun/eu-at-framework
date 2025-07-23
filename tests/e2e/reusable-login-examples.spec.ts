import { test, expect } from '@playwright/test';
import {
    generateOpcoTest,
    generateOpcoTestSuite,
    TestGeneratorOptions,
    OpcoTestContext,
    clearAllStoredLoginStates
} from '../../utils/test-generator';

/**
 * Reusable Login Flow Examples
 * 
 * This file demonstrates how to:
 * 1. Perform login once and store the state
 * 2. Reuse the login state for follow-up tests without re-running login steps
 * 3. Run multiple tests that require authentication efficiently
 */

// ============================================================================
// EXAMPLE 1: Individual Tests with Shared Login State
// ============================================================================

// Test 1: Initial login test (stores login state)
// generateOpcoTest(
//   'should login and store state for reuse @login',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Performing initial login for ${context.opco}`);

//     // The login is automatically handled by the framework
//     // and the state is stored for reuse

//     // Verify we're logged in by checking for user-specific elements
//     await expect(page.locator('[data-testid="user-menu"], .user-menu, .profile-menu')).toBeVisible();

//     // Take a screenshot to verify login success
//     await page.screenshot({ path: `login-success-${context.opco}.png` });
//   },
//   {
//     opcos: ['ace', 'dpl', 'pep'],
//     credentialId: 'login',
//     requiresLogin: true // This triggers the login flow and stores state
//   }
// );

// // Test 2: Follow-up test that uses stored login state (no re-login)
// generateOpcoTest(
//   'should access user profile without re-login',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Accessing user profile for ${context.opco} using stored login state`);

//     // Navigate to user profile page
//     await page.goto(context.secureBaseUrl + '/profile');

//     // Verify we can access the profile page (requires authentication)
//     await expect(page).toHaveTitle(/Profile|Account/);
//     await expect(page.locator('[data-testid="profile-section"], .profile-section')).toBeVisible();

//     // Verify user information is displayed
//     await expect(page.locator('[data-testid="user-name"], .user-name')).toBeVisible();
//   },
//   {
//     opcos: ['ace', 'dpl', 'pep'],
//     credentialId: 'login',
//     useSharedLogin: true // Uses stored login state, doesn't re-login
//   }
// );

// // Test 3: Another follow-up test using the same login state
// generateOpcoTest(
//   'should access billing information without re-login',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Accessing billing info for ${context.opco} using stored login state`);

//     // Navigate to billing page
//     await page.goto(context.secureBaseUrl + '/billing');

//     // Verify we can access the billing page
//     await expect(page).toHaveTitle(/Billing|Payment/);
//     await expect(page.locator('[data-testid="billing-section"], .billing-section')).toBeVisible();

//     // Verify billing information is displayed
//     await expect(page.locator('[data-testid="account-balance"], .account-balance')).toBeVisible();
//   },
//   {
//     opcos: ['ace', 'dpl', 'pep'],
//     credentialId: 'login',
//     useSharedLogin: true // Uses stored login state, doesn't re-login
//   }
// );

// ============================================================================
// EXAMPLE 2: Test Suite with Shared Login State
// ============================================================================

// Note: Storage state management is handled automatically by the test generator

// Define a suite of tests that all use the same login state
const authenticatedUserTests = [
    {
        name: 'should view account dashboard @login',
        function: async (context: OpcoTestContext, page: any) => {
            console.log(`Viewing dashboard for ${context.opco}`);            await page.goto(context.secureBaseUrl + '/accounts/dashboard');
            await expect(page.locator('body > app-root > app-dashboard > main > app-account-navigation-banner')).toBeVisible({ timeout: 70000 });
        }
    },
    {
        name: 'should view make a payment page @login',
        function: async (context: OpcoTestContext, page: any) => {
            await page.goto(context.secureBaseUrl + '/payments/payonline');
            await expect(page.locator('section.make-a-payment')).toBeVisible({ timeout: 100000 });
        }
    },
    {
        name: 'should view start service page @login',
        function: async (context: OpcoTestContext, page: any) => {

            await page.goto(context.secureBaseUrl + '/CustomerServices/service/start');
            await expect(page.locator('div.new-address-selection')).toBeVisible({ timeout: 100000 });
        }
    }
];

// Generate the test suite with shared login state
generateOpcoTestSuite(
    'Authenticated User Workflow',
    authenticatedUserTests,
    {
        credentialId: 'login',
        useSharedLogin: true // All tests in the suite use the same login state
    }
);

// ============================================================================
// EXAMPLE 3: Mixed Login Requirements
// ============================================================================

// // Test that doesn't require login (anonymous flow)
// generateOpcoTest(
//     'should view public homepage without login',
//     async (context: OpcoTestContext, page) => {
//         console.log(`Viewing public homepage for ${context.opco}`);

//         await page.goto(context.baseUrl);
//         await expect(page).toHaveTitle(/./);

//         // Verify public content is accessible
//         await expect(page.locator('[data-testid="public-content"], .public-content')).toBeVisible();
//     },
//     {
//         opcos: ['ace', 'dpl', 'pep'],
//         credentialId: 'login'
//         // No login required - uses anonymous URL
//     }
// );

// // Test that requires fresh login (not using shared state)
// generateOpcoTest(
//     'should perform fresh login for sensitive operations',
//     async (context: OpcoTestContext, page) => {
//         console.log(`Performing fresh login for sensitive operations on ${context.opco}`);

//         // This will perform a fresh login, not use stored state
//         await page.goto(context.secureBaseUrl + '/admin');

//         // Verify admin access
//         await expect(page.locator('[data-testid="admin-panel"], .admin-panel')).toBeVisible();
//     },
//     {
//         opcos: ['ace', 'dpl', 'pep'],
//         credentialId: 'login',
//         requiresLogin: true // Forces fresh login, doesn't use shared state
//     }
// );

// // ============================================================================
// // EXAMPLE 4: Cleanup and State Management
// // ============================================================================

// // Test to demonstrate clearing stored login state
// generateOpcoTest(
//     'should clear stored login state after sensitive operations',
//     async (context: OpcoTestContext, page) => {
//         console.log(`Clearing stored login state for ${context.opco}`);

//         // Perform some sensitive operation
//         await page.goto(context.secureBaseUrl + '/logout');
//         await expect(page.locator('[data-testid="logout-success"], .logout-success')).toBeVisible();

//         // Clear the stored login state for this opco
//         clearStoredLoginState(context.opco);

//         console.log(`Stored login state cleared for ${context.opco}`);
//     },
//     {
//         opcos: ['ace', 'dpl', 'pep'],
//         credentialId: 'login',
//         requiresLogin: true
//     }
// );

// // ============================================================================
// // EXAMPLE 5: Environment-Specific Login Tests
// // ============================================================================

// // Stage-only tests with shared login
// generateOpcoTest(
//     'should test stage-specific features with shared login',
//     async (context: OpcoTestContext, page) => {
//         console.log(`Testing stage features for ${context.opco}`);

//         // Navigate to stage-specific features
//         await page.goto(context.secureBaseUrl + '/stage-features');
//         await expect(page.locator('[data-testid="stage-features"], .stage-features')).toBeVisible();
//     },
//     {
//         environment: 'stage',
//         opcos: ['ace', 'dpl', 'pep'],
//         credentialId: 'login',
//         useSharedLogin: true
//     }
// );

// // Production-only tests with shared login
// generateOpcoTest(
//     'should test production-specific features with shared login',
//     async (context: OpcoTestContext, page) => {
//         console.log(`Testing production features for ${context.opco}`);

//         // Navigate to production-specific features
//         await page.goto(context.secureBaseUrl + '/production-features');
//         await expect(page.locator('[data-testid="production-features"], .production-features')).toBeVisible();
//     },
//     {
//         environment: 'production',
//         opcos: ['ace', 'dpl', 'pep'],
//         credentialId: 'login',
//         useSharedLogin: true
//     }
// ); 

// ============================================================================
// CLEANUP: Global Teardown
// ============================================================================

// Note: Storage state cleanup is handled automatically by the test generator
// No manual cleanup needed here to avoid interfering with cross-opco state sharing