import { test, expect } from '@playwright/test';
import { MultiOpcoTestRunner, createMultiOpcoTestRunner, OpcoTestContext } from '../../utils/multi-opco-test-runner';

/**
 * Multi-Opco Integration API Tests
 * 
 * These tests demonstrate how to run the same API test logic across multiple opcos.
 * Tests are tagged for selective execution:
 * - @integration: Integration test category
 * - @api: API functionality
 * - @multi-opco: Multi-opco test
 * - @env:stage: Environment (stage or production)
 * - @opcos:bge,comed,peco: Specific opcos to test (optional)
 */

test.describe('Multi-Opco Integration API Tests', () => {
  let multiOpcoRunner: MultiOpcoTestRunner;

  test.beforeEach(async ({ request }) => {
    // Initialize multi-opco test runner
    multiOpcoRunner = createMultiOpcoTestRunner({
      environment: 'stage',
      testCategory: 'api',
      testName: 'multi-opco-api'
    });
  });

  test('should connect to authentication API across all opcos @integration @api @multi-opco @env:stage', async ({ request }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing authentication API for opco: ${context.opco}`);
      
      // Test authentication endpoint for this opco
      const response = await request.post(`${context.baseUrl}/api/auth/login`, {
        data: {
          username: context.credentials.username,
          password: context.credentials.password
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('user');
      
      console.log(`Successfully tested authentication API for ${context.opco}`);
    }
  });

  test('should connect to outages API across all opcos @integration @api @multi-opco @env:stage', async ({ request }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing outages API for opco: ${context.opco}`);
      
      // First get authentication token for this opco
      const authResponse = await request.post(`${context.baseUrl}/api/auth/login`, {
        data: {
          username: context.credentials.username,
          password: context.credentials.password
        }
      });

      const authData = await authResponse.json();
      const token = authData.token;

      // Test outages endpoint for this opco
      const response = await request.get(`${context.baseUrl}/api/outages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
      
      console.log(`Successfully tested outages API for ${context.opco}`);
    }
  });

  test('should connect to payments API across all opcos @integration @api @multi-opco @env:stage', async ({ request }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing payments API for opco: ${context.opco}`);
      
      // First get authentication token for this opco
      const authResponse = await request.post(`${context.baseUrl}/api/auth/login`, {
        data: {
          username: context.credentials.username,
          password: context.credentials.password
        }
      });

      const authData = await authResponse.json();
      const token = authData.token;

      // Test payments endpoint for this opco
      const response = await request.get(`${context.baseUrl}/api/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
      
      console.log(`Successfully tested payments API for ${context.opco}`);
    }
  });

  test('should handle API errors gracefully across all opcos @integration @api @multi-opco @env:stage', async ({ request }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing API error handling for opco: ${context.opco}`);
      
      // Test with invalid credentials for this opco
      const response = await request.post(`${context.baseUrl}/api/auth/login`, {
        data: {
          username: 'invalid_user',
          password: 'invalid_password'
        }
      });

      expect(response.status()).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
      
      console.log(`Successfully tested API error handling for ${context.opco}`);
    }
  });

  test('should validate API response format across all opcos @integration @api @multi-opco @env:stage', async ({ request }) => {
    const opcosToTest = multiOpcoRunner.getOpcosToTest();
    
    for (const opco of opcosToTest) {
      const context = multiOpcoRunner.createOpcoTestContext(opco);
      
      console.log(`Testing API response format for opco: ${context.opco}`);
      
      // Test user profile endpoint for this opco
      const authResponse = await request.post(`${context.baseUrl}/api/auth/login`, {
        data: {
          username: context.credentials.username,
          password: context.credentials.password
        }
      });

      const authData = await authResponse.json();
      const token = authData.token;

      const response = await request.get(`${context.baseUrl}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      
      // Validate response structure
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('username');
      expect(responseBody).toHaveProperty('email');
      expect(responseBody).toHaveProperty('opco');
      
      console.log(`Successfully tested API response format for ${context.opco}`);
    }
  });
}); 