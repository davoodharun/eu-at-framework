// import { expect } from '@playwright/test';
// import { 
//   generateOpcoTest, 
//   generateOpcoAPITest,
//   TestGeneratorOptions, 
//   OpcoTestContext 
// } from '../../utils/test-generator';

// /**
//  * Unified Test Examples
//  * 
//  * This file demonstrates the simplified unified approach:
//  * 1. If no environment is specified, runs in both stage and production
//  * 2. If environment is specified, runs only in that environment
//  * 3. If no opcos are specified, uses OPCO_LIST/OPCO_SKIP logic
//  * 4. If opcos are specified, runs only for those opcos
//  */

// // ============================================================================
// // E2E TESTS
// // ============================================================================

// // Example 1: Test that runs in both environments for all opcos (default behavior)
// generateOpcoTest(
//   'should run in both environments for all opcos (default)',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running default test for ${context.opco} in ${context.secureBaseUrl}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
//   },
//   {
//     credentialId: 'login'
//     // No environment specified = runs in both stage and production
//     // No opcos specified = uses OPCO_LIST/OPCO_SKIP logic
//   }
// );

// // Example 2: Test that runs only in stage environment
// generateOpcoTest(
//   'should run only in stage environment',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running stage-only test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
//     console.log('Running stage-specific logic');
//   },
//   {
//     environment: 'stage', // Only runs in stage
//     credentialId: 'login'
//   }
// );

// // Example 3: Test that runs only in production environment
// generateOpcoTest(
//   'should run only in production environment',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running production-only test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
//     console.log('Running production-specific logic');
//   },
//   {
//     environment: 'production', // Only runs in production
//     credentialId: 'login'
//   }
// );

// // Example 4: Test that runs only for specific opcos (ace, dpl, pep) with login
// generateOpcoTest(
//   'user should successfully login and store state',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running login test for ${context.opco}`);
    
//     // The login is automatically handled by the framework
//     // and the state is stored for reuse
    
//     // Verify we're logged in by checking for user-specific elements
//     await expect(page.locator('[data-testid="user-menu"], .user-menu, .profile-menu')).toBeVisible();
    
//     // Take screenshot for verification
//     await page.screenshot({ path: `login-success-${context.opco}.png` });
//   },
//   {
//     opcos: ['ace', 'dpl', 'pep'], // Only runs for ace, dpl, and pep
//     credentialId: 'login',
//     requiresLogin: true // This triggers the login flow and stores state
//   }
// );

// // Example 4b: Follow-up test using stored login state
// generateOpcoTest(
//   'user should access authenticated content without re-login',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Accessing authenticated content for ${context.opco} using stored login state`);
    
//     // Navigate to authenticated content
//     await page.goto(context.secureBaseUrl + '/dashboard');
    
//     // Verify we can access authenticated content
//     await expect(page.locator('[data-testid="dashboard"], .dashboard')).toBeVisible();
//   },
//   {
//     opcos: ['ace', 'dpl', 'pep'], // Only runs for ace, dpl, and pep
//     credentialId: 'login',
//     useSharedLogin: true // Uses stored login state, doesn't re-login
//   }
// );

// // Example 5: Test that runs only in stage for specific opcos
// generateOpcoTest(
//   'should run only in stage for com and pec',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running stage + com/pec specific test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
    
//     // Add opco-specific logic
//     if (context.opco === 'com') {
//       console.log('Running ComEd-specific logic');
//     } else if (context.opco === 'pec') {
//       console.log('Running PECO-specific logic');
//     }
//   },
//   {
//     environment: 'stage', // Only runs in stage
//     opcos: ['com', 'pec'], // Only runs for com and pec
//     credentialId: 'login'
//   }
// );

// // Example 6: Test that runs in multiple specific environments
// generateOpcoTest(
//   'should run in stage and production for dpl and pep',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running multi-env + dpl/pep specific test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
    
//     // Add opco-specific logic
//     if (context.opco === 'dpl') {
//       console.log('Running Delmarva-specific logic');
//     } else if (context.opco === 'pep') {
//       console.log('Running PEPCO-specific logic');
//     }
//   },
//   {
//     environment: ['stage', 'production'], // Runs in both environments
//     opcos: ['dpl', 'pep'], // Only runs for dpl and pep
//     credentialId: 'login'
//   }
// );

// // ============================================================================
// // API TESTS
// // ============================================================================

// // Example 7: API test that runs in both environments for all opcos
// generateOpcoAPITest(
//   'should run API test in both environments for all opcos',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running default API test for ${context.opco} in ${context.baseUrl}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
//   },
//   {
//     credentialId: 'login'
//     // No environment specified = runs in both stage and production
//     // No opcos specified = uses OPCO_LIST/OPCO_SKIP logic
//   }
// );

// // Example 8: API test that runs only in production for specific opcos
// generateOpcoAPITest(
//   'should run API test only in production for ace and bge',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running production + ace/bge API test for ${context.opco}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
    
//     // Add opco-specific API logic
//     if (context.opco === 'ace') {
//       console.log('Running ACE-specific API logic');
//     } else if (context.opco === 'bge') {
//       console.log('Running BGE-specific API logic');
//     }
//   },
//   {
//     environment: 'production', // Only runs in production
//     opcos: ['ace', 'bge'], // Only runs for ace and bge
//     credentialId: 'login'
//   }
// ); 