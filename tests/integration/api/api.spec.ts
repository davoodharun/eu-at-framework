// import { test, expect } from '@playwright/test';
// import { BaseTest } from '../../../utils/test-base';

// /**
//  * Integration API Tests
//  * 
//  * These tests verify API endpoints and backend connectivity across different opcos and environments.
//  * Tests are tagged for selective execution:
//  * - @integration: Integration test category
//  * - @api: API functionality
//  * - @opco:bge: Specific opco (can be changed for different opcos)
//  * - @env:stage: Environment (stage or production)
//  */

// test.describe('Integration API Tests', () => {
//   let baseTest: BaseTest;

//   test.beforeEach(async ({ request }) => {
//     // Get opco from environment variable or default to 'bge'
//     const opcoList = process.env.OPCO_LIST;
//     let targetOpco = 'bge'; // default
    
//     if (opcoList) {
//       const opcos = opcoList.split(',').map(opco => opco.trim());
//       // Use the first opco in the list, or default to 'bge' if not found
//       targetOpco = opcos.find(opco => ['bge', 'com', 'pec', 'ace', 'dpl', 'pep'].includes(opco)) || 'bge';
//     }
    
//     // Initialize base test with API category
//     baseTest = new BaseTest({
//       opco: targetOpco,
//       environment: 'stage',
//       testCategory: 'api',
//       testName: 'api-connectivity'
//     });
//   });

//   test('should connect to authentication API @integration @api @env:stage', async ({ request }) => {
//     // Test authentication endpoint
//     const response = await request.post(`${baseTest['baseUrl']}/api/auth/login`, {
//       data: {
//         username: baseTest['credentials'].username,
//         password: baseTest['credentials'].password
//       }
//     });

//     expect(response.status()).toBe(200);
//     const responseBody = await response.json();
//     expect(responseBody).toHaveProperty('token');
//     expect(responseBody).toHaveProperty('user');
//   });

//   test('should connect to outages API @integration @api @env:stage', async ({ request }) => {
//     // First get authentication token
//     const authResponse = await request.post(`${baseTest['baseUrl']}/api/auth/login`, {
//       data: {
//         username: baseTest['credentials'].username,
//         password: baseTest['credentials'].password
//       }
//     });

//     const authData = await authResponse.json();
//     const token = authData.token;

//     // Test outages endpoint
//     const response = await request.get(`${baseTest['baseUrl']}/api/outages`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     expect(response.status()).toBe(200);
//     const responseBody = await response.json();
//     expect(Array.isArray(responseBody)).toBe(true);
//   });

//   test('should connect to payments API @integration @api @env:stage', async ({ request }) => {
//     // First get authentication token
//     const authResponse = await request.post(`${baseTest['baseUrl']}/api/auth/login`, {
//       data: {
//         username: baseTest['credentials'].username,
//         password: baseTest['credentials'].password
//       }
//     });

//     const authData = await authResponse.json();
//     const token = authData.token;

//     // Test payments endpoint
//     const response = await request.get(`${baseTest['baseUrl']}/api/payments`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     expect(response.status()).toBe(200);
//     const responseBody = await response.json();
//     expect(Array.isArray(responseBody)).toBe(true);
//   });

//   test('should handle API errors gracefully @integration @api @env:stage', async ({ request }) => {
//     // Test with invalid credentials
//     const response = await request.post(`${baseTest['baseUrl']}/api/auth/login`, {
//       data: {
//         username: 'invalid_user',
//         password: 'invalid_password'
//       }
//     });

//     expect(response.status()).toBe(401);
//     const responseBody = await response.json();
//     expect(responseBody).toHaveProperty('error');
//   });

//   test('should validate API response format @integration @api @env:stage', async ({ request }) => {
//     // Test user profile endpoint
//     const authResponse = await request.post(`${baseTest['baseUrl']}/api/auth/login`, {
//       data: {
//         username: baseTest['credentials'].username,
//         password: baseTest['credentials'].password
//       }
//     });

//     const authData = await authResponse.json();
//     const token = authData.token;

//     const response = await request.get(`${baseTest['baseUrl']}/api/user/profile`, {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     expect(response.status()).toBe(200);
//     const responseBody = await response.json();
    
//     // Validate response structure
//     expect(responseBody).toHaveProperty('id');
//     expect(responseBody).toHaveProperty('username');
//     expect(responseBody).toHaveProperty('email');
//     expect(responseBody).toHaveProperty('opco');
//   });
// }); 