import { test as base, expect, Page } from '@playwright/test';
import { getTestCredentials, TestCredentials } from '../config/credentials';
import { getOpcoUrl, OpcoConfig } from '../config/environments';

export interface TestOptions {
  opco: string;
  environment: 'stage' | 'production';
  testCategory: string;
  testName?: string;
}

export class BaseTest {
  public opco: string;
  public environment: 'stage' | 'production';
  public testCategory: string;
  public testName?: string;
  public credentials: TestCredentials;
  public baseUrl: string;

  constructor(options: TestOptions) {
    this.opco = options.opco;
    this.environment = options.environment;
    this.testCategory = options.testCategory;
    this.testName = options.testName;
    
    // Get credentials for this specific test
    this.credentials = getTestCredentials(
      this.opco,
      this.environment,
      this.testCategory,
      this.testName
    );
    
    // Get the base URL for this opco and environment
    const url = getOpcoUrl(this.opco, this.environment);
    if (!url) {
      throw new Error(`No URL found for opco: ${this.opco}, environment: ${this.environment}`);
    }
    this.baseUrl = url;
  }

  public async navigateToPage(page: Page, path: string = '/'): Promise<void> {
    const fullUrl = `${this.baseUrl}${path}`;
    await page.goto(fullUrl);
  }

  public async login(page: Page): Promise<void> {
    // Navigate to login page
    await this.navigateToPage(page, '/login');
    
    // Fill in credentials
    await page.fill('[data-testid="username"]', this.credentials.username);
    await page.fill('[data-testid="password"]', this.credentials.password);
    
    // Submit login form
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login (adjust selector based on actual implementation)
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
  }

  public async logout(page: Page): Promise<void> {
    // Click on user menu
    await page.click('[data-testid="user-menu"]');
    
    // Click logout
    await page.click('[data-testid="logout-button"]');
    
    // Wait for logout to complete
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 10000 });
  }

  public async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
  }

  public async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ 
      path: `test-results/screenshots/${this.opco}_${this.environment}_${name}.png`,
      fullPage: true 
    });
  }
}

// Custom test fixture that includes the base test functionality
export const test = base.extend<{ baseTest: BaseTest }>({
  baseTest: async ({}, use, testInfo) => {
    // Extract test options from test name or tags
    const testName = testInfo.title;
    const tags = testInfo.tags || [];
    
    // Parse test options from tags or test name
    const opco = tags.find(tag => tag.startsWith('@opco:'))?.split(':')[1] || 'bge';
    const environment = tags.find(tag => tag.startsWith('@env:'))?.split(':')[1] as 'stage' | 'production' || 'stage';
    const testCategory = tags.find(tag => tag.startsWith('@category:'))?.split(':')[1] || 'general';
    
    const baseTest = new BaseTest({
      opco,
      environment,
      testCategory,
      testName
    });
    
    await use(baseTest);
  }
});

export { expect } from '@playwright/test'; 