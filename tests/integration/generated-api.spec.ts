import { expect } from '@playwright/test';
import { generateOpcoAPITest, TestGeneratorOptions, OpcoTestContext } from '../../utils/test-generator';

/**
 * Generated API Tests
 * 
 * These tests are dynamically generated based on the OPCO_LIST environment variable.
 * Run with: npm run test:api:bge or npm run test:api:stage
 */

// Test 1: Authentication API
generateOpcoAPITest(
  'should connect to authentication API',
  async (context: OpcoTestContext, request) => {
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
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);

// Test 2: Outages API
generateOpcoAPITest(
  'should connect to outages API',
  async (context: OpcoTestContext, request) => {
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
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);

// Test 3: Payments API
generateOpcoAPITest(
  'should connect to payments API',
  async (context: OpcoTestContext, request) => {
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
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);

// Test 4: Error handling
generateOpcoAPITest(
  'should handle API errors gracefully',
  async (context: OpcoTestContext, request) => {
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
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);

// Test 5: Response format validation
generateOpcoAPITest(
  'should validate API response format',
  async (context: OpcoTestContext, request) => {
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
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
); 