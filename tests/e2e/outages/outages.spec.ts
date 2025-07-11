import { test, expect } from '@playwright/test';
import { BaseTest } from '../../../utils/test-base';

/**
 * E2E Outages Tests
 * 
 * These tests verify the outage functionality across different opcos and environments.
 * Tests are tagged for selective execution:
 * - @e2e: E2E test category
 * - @outages: Outage functionality
 * - @opco:bge: Specific opco (can be changed for different opcos)
 * - @env:stage: Environment (stage or production)
 */

test.describe('E2E Outages Tests', () => {
  let baseTest: BaseTest;

  test.beforeEach(async ({ page }) => {
    // Initialize base test with outages category
    baseTest = new BaseTest({
      opco: 'bge',
      environment: 'stage',
      testCategory: 'outages',
      testName: 'outage-reporting'
    });
  });

  test('should display outage map @e2e @outages @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to outages page
    await baseTest.navigateToPage(page, '/outages');
    
    // Verify outage map is displayed
    await expect(page.locator('[data-testid="outage-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="outage-list"]')).toBeVisible();
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'outage-map');
  });

  test('should report new outage @e2e @outages @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to report outage page
    await baseTest.navigateToPage(page, '/outages/report');
    
    // Fill in outage details
    await page.fill('[data-testid="outage-address"]', '123 Test Street');
    await page.fill('[data-testid="outage-description"]', 'Power outage test');
    await page.selectOption('[data-testid="outage-type"]', 'planned');
    
    // Submit outage report
    await page.click('[data-testid="submit-outage"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Outage reported successfully');
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'outage-reported');
  });

  test('should search for outages by address @e2e @outages @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to outages page
    await baseTest.navigateToPage(page, '/outages');
    
    // Search for outages
    await page.fill('[data-testid="address-search"]', '123 Test Street');
    await page.click('[data-testid="search-button"]');
    
    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'outage-search');
  });

  test('should display outage status updates @e2e @outages @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to outages page
    await baseTest.navigateToPage(page, '/outages');
    
    // Click on an outage to view details
    await page.click('[data-testid="outage-item"]');
    
    // Verify outage details are displayed
    await expect(page.locator('[data-testid="outage-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-updates"]')).toBeVisible();
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'outage-details');
  });
}); 