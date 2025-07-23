// import { expect } from '@playwright/test';
// import { 
//   generateOpcoTest, 
//   generateOpcoAPITest,
//   TestGeneratorOptions, 
//   OpcoTestContext 
// } from '../../utils/test-generator';

// /**
//  * Opco-Specific Test Examples (Updated for Unified Approach)
//  * 
//  * This file demonstrates different ways to tag tests for specific opcos:
//  * 1. Regular tests (respect OPCO_LIST environment variable)
//  * 2. Opco-specific tests (run only for specified opcos)
//  * 3. All-opcos tests (run for all opcos regardless of OPCO_LIST)
//  */

// // ============================================================================
// // E2E TESTS
// // ============================================================================

// // Test 1: Regular test - respects OPCO_LIST environment variable
// generateOpcoTest(
//   'should run regular test (respects OPCO_LIST)',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running regular test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login'
//   }
// );

// // Test 2: Opco-specific test - runs only for ace and bge
// generateOpcoTest(
//   'should run only for ace and bge',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running ace/bge specific test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
    
//     // Add opco-specific logic here
//     if (context.opco === 'ace') {
//       console.log('Running ACE-specific logic');
//     } else if (context.opco === 'bge') {
//       console.log('Running BGE-specific logic');
//     }
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login',
//     opcos: ['ace', 'bge'] // Only runs for ace and bge
//   }
// );

// // Test 3: All-opcos test - runs for all opcos regardless of OPCO_LIST
// generateOpcoTest(
//   'should run for all opcos (regardless of OPCO_LIST)',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running all-opcos test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login'
//     // No opcos specified = uses OPCO_LIST/OPCO_SKIP logic
//   }
// );

// // Test 4: Another opco-specific test - runs only for com and pec
// generateOpcoTest(
//   'should run only for com and pec',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running com/pec specific test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
    
//     // Add opco-specific logic here
//     if (context.opco === 'com') {
//       console.log('Running ComEd-specific logic');
//     } else if (context.opco === 'pec') {
//       console.log('Running PECO-specific logic');
//     }
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login',
//     opcos: ['com', 'pec'] // Only runs for com and pec
//   }
// );

// // ============================================================================
// // API TESTS
// // ============================================================================

// // Test 5: Regular API test - respects OPCO_LIST environment variable
// generateOpcoAPITest(
//   'should run regular API test (respects OPCO_LIST)',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running regular API test for ${context.opco}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login'
//   }
// );

// // Test 6: Opco-specific API test - runs only for dpl and pep
// generateOpcoAPITest(
//   'should run API test only for dpl and pep',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running dpl/pep specific API test for ${context.opco}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
    
//     // Add opco-specific API logic here
//     if (context.opco === 'dpl') {
//       console.log('Running Delmarva-specific API logic');
//     } else if (context.opco === 'pep') {
//       console.log('Running PEPCO-specific API logic');
//     }
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login',
//     opcos: ['dpl', 'pep'] // Only runs for dpl and pep
//   }
// );

// // Test 7: All-opcos API test - runs for all opcos regardless of OPCO_LIST
// generateOpcoAPITest(
//   'should run API test for all opcos (regardless of OPCO_LIST)',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running all-opcos API test for ${context.opco}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
//   },
//   {
//     environment: 'stage',
//     testCategory: 'login'
//     // No opcos specified = uses OPCO_LIST/OPCO_SKIP logic
//   }
// ); 