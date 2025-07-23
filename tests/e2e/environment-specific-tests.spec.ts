// import { expect } from '@playwright/test';
// import { 
//   generateOpcoTest, 
//   generateOpcoAPITest,
//   TestGeneratorOptions, 
//   OpcoTestContext 
// } from '../../utils/test-generator';

// /**
//  * Environment-Specific Test Examples (Updated for Unified Approach)
//  * 
//  * This file demonstrates different ways to tag tests for specific environments:
//  * 1. Regular tests (respect TEST_ENVIRONMENT environment variable)
//  * 2. Environment-specific tests (run only for specified environment)
//  * 3. All-environments tests (run for both stage and production)
//  */

// // ============================================================================
// // E2E TESTS
// // ============================================================================

// // Test 1: Regular test - respects TEST_ENVIRONMENT environment variable
// generateOpcoTest(
//   'should run regular test (respects TEST_ENVIRONMENT)',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running regular test for ${context.opco} in ${context.secureBaseUrl}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
//   },
//   {
//     environment: 'stage', // Default, but can be overridden by TEST_ENVIRONMENT
//     testCategory: 'login'
//   }
// );

// // Test 2: Stage-specific test - runs only for stage environment
// generateOpcoTest(
//   'should run only for stage environment',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running stage-specific test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
    
//     // Add stage-specific logic here
//     console.log('Running stage-specific logic');
//   },
//   {
//     environment: 'stage', // Only runs in stage
//     testCategory: 'login'
//   }
// );

// // Test 3: Production-specific test - runs only for production environment
// generateOpcoTest(
//   'should run only for production environment',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running production-specific test for ${context.opco}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
    
//     // Add production-specific logic here
//     console.log('Running production-specific logic');
//   },
//   {
//     environment: 'production', // Only runs in production
//     testCategory: 'login'
//   }
// );

// // Test 4: All-environments test - runs for both stage and production
// generateOpcoTest(
//   'should run for all environments',
//   async (context: OpcoTestContext, page) => {
//     console.log(`Running all-environments test for ${context.opco} in ${context.secureBaseUrl}`);
//     await page.goto(context.baseUrl);
//     await expect(page).toHaveTitle(/./);
    
//     // Add environment-agnostic logic here
//     console.log('Running environment-agnostic logic');
//   },
//   {
//     testCategory: 'login'
//     // No environment specified = runs in both stage and production
//   }
// );

// // ============================================================================
// // API TESTS
// // ============================================================================

// // Test 5: Regular API test - respects TEST_ENVIRONMENT environment variable
// generateOpcoAPITest(
//   'should run regular API test (respects TEST_ENVIRONMENT)',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running regular API test for ${context.opco} in ${context.baseUrl}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
//   },
//   {
//     environment: 'stage', // Default, but can be overridden by TEST_ENVIRONMENT
//     testCategory: 'login'
//   }
// );

// // Test 6: Stage-specific API test - runs only for stage environment
// generateOpcoAPITest(
//   'should run API test only for stage environment',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running stage-specific API test for ${context.opco}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
    
//     // Add stage-specific API logic here
//     console.log('Running stage-specific API logic');
//   },
//   {
//     environment: 'stage', // Only runs in stage
//     testCategory: 'login'
//   }
// );

// // Test 7: Production-specific API test - runs only for production environment
// generateOpcoAPITest(
//   'should run API test only for production environment',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running production-specific API test for ${context.opco}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
    
//     // Add production-specific API logic here
//     console.log('Running production-specific API logic');
//   },
//   {
//     environment: 'production', // Only runs in production
//     testCategory: 'login'
//   }
// );

// // Test 8: All-environments API test - runs for both stage and production
// generateOpcoAPITest(
//   'should run API test for all environments',
//   async (context: OpcoTestContext, request) => {
//     console.log(`Running all-environments API test for ${context.opco} in ${context.baseUrl}`);
//     const response = await request.get(context.baseUrl);
//     expect(response.status()).toBe(200);
    
//     // Add environment-agnostic API logic here
//     console.log('Running environment-agnostic API logic');
//   },
//   {
//     testCategory: 'login'
//     // No environment specified = runs in both stage and production
//   }
// ); 