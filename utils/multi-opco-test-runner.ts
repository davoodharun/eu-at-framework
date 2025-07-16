import { test as base, expect, Page } from '@playwright/test';
import { getAllOpcos, OpcoConfig } from '../config/environments';
import { getTestCredentials, TestCredentials } from '../config/credentials';

export interface MultiOpcoTestOptions {
  opcos?: string[]; // Specific opcos to test, if not provided, tests all opcos
  environment: 'stage' | 'production';
  testCategory: string;
  testName?: string;
  skipOpcos?: string[]; // Opcos to skip
}

export interface OpcoTestContext {
  opco: string;
  opcoConfig: OpcoConfig;
  credentials: TestCredentials;
  baseUrl: string;
  secureBaseUrl: string;
}

export class MultiOpcoTestRunner {
  private options: MultiOpcoTestOptions;

  constructor(options: MultiOpcoTestOptions) {
    this.options = options;
  }

  /**
   * Get the list of opcos to test based on the options
   */
  public getOpcosToTest(): OpcoConfig[] {
    const allOpcos = getAllOpcos(this.options.environment);
    
    if (this.options.opcos && this.options.opcos.length > 0) {
      // Filter to specific opcos
      return allOpcos.filter(opco => 
        this.options.opcos!.includes(opco.name) && 
        !this.options.skipOpcos?.includes(opco.name)
      );
    }
    
    // Return all opcos except skipped ones
    return allOpcos.filter(opco => 
      !this.options.skipOpcos?.includes(opco.name)
    );
  }

  /**
   * Create test context for a specific opco
   */
  public createOpcoTestContext(opco: OpcoConfig): OpcoTestContext {
    const credentials = getTestCredentials(
      opco.name,
      this.options.environment,
      this.options.testCategory,
      this.options.testName
    );

    return {
      opco: opco.name,
      opcoConfig: opco,
      credentials,
      baseUrl: opco.anonUrl,
      secureBaseUrl: opco.secureUrl
    };
  }

  /**
   * Helper method to navigate to a page for a specific opco
   */
  public async navigateToPage(context: OpcoTestContext, page: Page, path: string = "/"): Promise<void> {
    const fullUrl = `${context.baseUrl}${path}`;
    await page.goto(fullUrl);
  }

  /**
   * Helper method to navigate to a secure page for a specific opco
   */
  public async navigateToSecurePage(context: OpcoTestContext, page: Page, path: string = "/"): Promise<void> {
    const fullUrl = `${context.secureBaseUrl}${path}`;
    await page.goto(fullUrl);
  }

  /**
   * Helper method to take a screenshot for a specific opco
   */
  public async takeScreenshot(context: OpcoTestContext, page: Page, name: string): Promise<void> {
    await page.screenshot({
      path: `test-results/screenshots/${context.opco}_${this.options.environment}_${name}.png`,
      fullPage: true,
    });
  }
}

/**
 * Helper function to create a multi-opco test runner
 */
export function createMultiOpcoTestRunner(options: MultiOpcoTestOptions): MultiOpcoTestRunner {
  return new MultiOpcoTestRunner(options);
}

/**
 * Custom test fixture for multi-opco testing
 */
export const multiOpcoTest = base.extend<{ multiOpcoRunner: MultiOpcoTestRunner }>({
  multiOpcoRunner: async ({}, use, testInfo) => {
    // Extract test options from test name or tags
    const tags = testInfo.tags || [];
    
    // Parse test options from tags
    const opcos = tags.find(tag => tag.startsWith('@opcos:'))?.split(':')[1]?.split(',') || [];
    const environment = tags.find(tag => tag.startsWith('@env:'))?.split(':')[1] as 'stage' | 'production' || 'stage';
    const testCategory = tags.find(tag => tag.startsWith('@category:'))?.split(':')[1] || 'general';
    const skipOpcos = tags.find(tag => tag.startsWith('@skip:'))?.split(':')[1]?.split(',') || [];
    
    const runner = new MultiOpcoTestRunner({
      opcos: opcos.length > 0 ? opcos : undefined,
      environment,
      testCategory,
      skipOpcos
    });
    
    await use(runner);
  }
});

export { expect } from '@playwright/test'; 