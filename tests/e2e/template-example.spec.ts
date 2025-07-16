import { expect } from '@playwright/test';
import { 
  createE2ETestTemplate, 
  createAPITestTemplate, 
  createTestSuite, 
  createAPITestSuite,
  CommonTestPatterns,
  TestTemplateOptions 
} from '../../utils/test-templates';
import { OpcoTestContext } from '../../utils/multi-opco-test-runner';

/**
 * Example demonstrating how to use test templates for multi-opco testing
 * 
 * This file shows different ways to create multi-opco tests using the templates:
 * 1. Individual test creation
 * 2. Test suite creation
 * 3. Using common patterns
 */

// Example 1: Individual E2E test using template
createE2ETestTemplate(
  'should navigate to homepage across all opcos @e2e @multi-opco @env:stage',
  async (context: OpcoTestContext, page) => {
    // Navigate to homepage
    await page.goto(context.baseUrl);
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Home/);
    
    // Take screenshot
    await page.screenshot({
      path: `test-results/screenshots/${context.opco}_${context.opcoConfig.name}_homepage.png`,
      fullPage: true,
    });
  },
  {
    environment: 'stage',
    testCategory: 'navigation'
  }
);

// Example 2: Individual API test using template
createAPITestTemplate(
  'should test health endpoint across all opcos @integration @api @multi-opco @env:stage',
  async (context: OpcoTestContext, request) => {
    const response = await request.get(`${context.baseUrl}/api/health`);
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('status');
    expect(responseBody.status).toBe('healthy');
  },
  {
    environment: 'stage',
    testCategory: 'api'
  }
);

// Example 3: Test suite using templates
createTestSuite(
  'Homepage Navigation Suite',
  [
    {
      name: 'should load homepage @e2e @multi-opco @env:stage',
      function: async (context: OpcoTestContext, page) => {
        await page.goto(context.baseUrl);
        await expect(page).toHaveTitle(/Home/);
      }
    },
    {
      name: 'should have working navigation menu @e2e @multi-opco @env:stage',
      function: async (context: OpcoTestContext, page) => {
        await page.goto(context.baseUrl);
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('nav a')).toHaveCount(1);
      }
    },
    {
      name: 'should have footer links @e2e @multi-opco @env:stage',
      function: async (context: OpcoTestContext, page) => {
        await page.goto(context.baseUrl);
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('footer a')).toHaveCount(1);
      }
    }
  ],
  {
    environment: 'stage',
    testCategory: 'navigation'
  }
);

// Example 4: API test suite using templates
createAPITestSuite(
  'API Health Suite',
  [
    {
      name: 'should return health status @integration @api @multi-opco @env:stage',
      function: async (context: OpcoTestContext, request) => {
        const response = await request.get(`${context.baseUrl}/api/health`);
        expect(response.status()).toBe(200);
      }
    },
    {
      name: 'should return version info @integration @api @multi-opco @env:stage',
      function: async (context: OpcoTestContext, request) => {
        const response = await request.get(`${context.baseUrl}/api/version`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('version');
      }
    }
  ],
  {
    environment: 'stage',
    testCategory: 'api'
  }
);

// Example 5: Using common patterns
createE2ETestTemplate(
  'should login and access dashboard across all opcos @e2e @multi-opco @env:stage',
  async (context: OpcoTestContext, page) => {
    // Use the common login pattern
    await CommonTestPatterns.login(context, page);
    
    // Additional dashboard-specific tests
    await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({
      path: `test-results/screenshots/${context.opco}_${context.opcoConfig.name}_dashboard.png`,
      fullPage: true,
    });
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);

// Example 6: API test using common authentication pattern
createAPITestTemplate(
  'should access protected endpoint across all opcos @integration @api @multi-opco @env:stage',
  async (context: OpcoTestContext, request) => {
    // Use the common API authentication pattern
    const token = await CommonTestPatterns.apiAuth(context, request);
    
    // Use the token to access a protected endpoint
    const response = await request.get(`${context.baseUrl}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(response.status()).toBe(200);
    const profile = await response.json();
    expect(profile).toHaveProperty('username');
    expect(profile).toHaveProperty('email');
  },
  {
    environment: 'stage',
    testCategory: 'api'
  }
);

// Example 7: Testing specific opcos only
createE2ETestTemplate(
  'should test specific opcos only @e2e @multi-opco @env:stage',
  async (context: OpcoTestContext, page) => {
    await page.goto(context.baseUrl);
    await expect(page).toHaveTitle(/Home/);
    console.log(`Testing specific opco: ${context.opco}`);
  },
  {
    environment: 'stage',
    testCategory: 'navigation',
    opcos: ['bge', 'comed', 'peco'] // Only test these specific opcos
  }
);

// Example 8: Skipping specific opcos
createE2ETestTemplate(
  'should test all opcos except specified ones @e2e @multi-opco @env:stage',
  async (context: OpcoTestContext, page) => {
    await page.goto(context.baseUrl);
    await expect(page).toHaveTitle(/Home/);
    console.log(`Testing opco (excluding skipped ones): ${context.opco}`);
  },
  {
    environment: 'stage',
    testCategory: 'navigation',
    skipOpcos: ['ace'] // Skip this opco
  }
); 