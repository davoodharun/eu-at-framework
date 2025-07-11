import { test, expect } from '@playwright/test';
import { BaseTest } from '../../../utils/test-base';

/**
 * E2E Payments Tests
 * 
 * These tests verify the payment functionality across different opcos and environments.
 * Tests are tagged for selective execution:
 * - @e2e: E2E test category
 * - @payments: Payment functionality
 * - @opco:bge: Specific opco (can be changed for different opcos)
 * - @env:stage: Environment (stage or production)
 */

test.describe('E2E Payments Tests', () => {
  let baseTest: BaseTest;

  test.beforeEach(async ({ page }) => {
    // Initialize base test with payments category
    baseTest = new BaseTest({
      opco: 'bge',
      environment: 'stage',
      testCategory: 'payments',
      testName: 'payment-processing'
    });
  });

  test('should display payment history @e2e @payments @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to payments page
    await baseTest.navigateToPage(page, '/payments');
    
    // Verify payment history is displayed
    await expect(page.locator('[data-testid="payment-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-list"]')).toBeVisible();
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'payment-history');
  });

  test('should make a payment @e2e @payments @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to make payment page
    await baseTest.navigateToPage(page, '/payments/make-payment');
    
    // Fill in payment details
    await page.fill('[data-testid="payment-amount"]', '100.00');
    await page.selectOption('[data-testid="payment-method"]', 'credit-card');
    await page.fill('[data-testid="card-number"]', '4111111111111111');
    await page.fill('[data-testid="expiry-date"]', '12/25');
    await page.fill('[data-testid="cvv"]', '123');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Payment processed successfully');
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'payment-success');
  });

  test('should schedule a payment @e2e @payments @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to schedule payment page
    await baseTest.navigateToPage(page, '/payments/schedule');
    
    // Fill in scheduled payment details
    await page.fill('[data-testid="payment-amount"]', '150.00');
    await page.fill('[data-testid="schedule-date"]', '2024-01-15');
    await page.selectOption('[data-testid="payment-method"]', 'bank-transfer');
    
    // Submit scheduled payment
    await page.click('[data-testid="schedule-payment"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Payment scheduled successfully');
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'payment-scheduled');
  });

  test('should view payment confirmation @e2e @payments @opco:bge @env:stage', async ({ page }) => {
    // Login first
    await baseTest.login(page);
    
    // Navigate to payments page
    await baseTest.navigateToPage(page, '/payments');
    
    // Click on a payment to view details
    await page.click('[data-testid="payment-item"]');
    
    // Verify payment details are displayed
    await expect(page.locator('[data-testid="payment-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirmation-number"]')).toBeVisible();
    
    // Take screenshot for verification
    await baseTest.takeScreenshot(page, 'payment-confirmation');
  });
}); 