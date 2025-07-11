# EU Automated Testing Framework

A comprehensive integration and end-to-end testing framework for EU operating companies using Playwright.

## Overview

This framework provides automated testing capabilities for 6 operating companies (opcos) across both stage and production environments:

### Production Sites
- bge.com
- comed.com
- peco.com
- atlanticcityelectric.com
- delmarva.com
- pepco.com

### Stage Sites
- azstage.bge.com
- azstage.comed.com
- azstage.peco.com
- azstage.atlanticcityelectric.com
- azstage.delmarva.com
- azstage.pepco.com

## Features

### 🏗️ Framework Architecture
- **Playwright-based**: Modern, reliable browser automation
- **TypeScript**: Type-safe development experience
- **Modular Design**: Reusable components and utilities
- **Parallel Execution**: Run tests across multiple opcos simultaneously

### 🏷️ Test Organization & Tagging
- **E2E Tests**: UI component and flow testing with backend integration
- **Integration Tests**: Middleware and backend connectivity testing
- **Category-based**: Tests grouped by functionality (login, outages, payments, etc.)
- **Tagged Execution**: Run specific test categories, opcos, or environments

### 🔐 Secure Credential Management
- **Environment-specific**: Different credentials for stage vs production
- **Opco-specific**: Unique credentials per operating company
- **Test-specific**: Different credentials for different test categories
- **YAML-based**: Easy to manage and version control

### 🌍 Dynamic Environment Support
- **Multi-environment**: Stage and production configurations
- **Multi-opco**: Support for all 6 operating companies
- **Parallel execution**: Run tests across multiple sites simultaneously
- **Environment-specific URLs**: Automatic URL resolution per opco and environment

## Project Structure

```
eu-automated-tests/
├── config/
│   ├── environments.ts      # Environment and opco configurations
│   ├── credentials.ts       # Credential management system
│   └── credentials.yml      # Credential storage (secure)
├── tests/
│   ├── e2e/                # End-to-end tests
│   │   ├── login/
│   │   ├── outages/
│   │   └── payments/
│   └── integration/        # Integration tests
│       └── api/
├── utils/
│   └── test-base.ts        # Base test class and utilities
├── playwright.config.ts     # Main Playwright configuration
├── playwright.stage.config.ts
├── playwright.prod.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npm run install-browsers
   ```

3. **Configure credentials**:
   - Edit `config/credentials.yml` with your actual test credentials
   - Follow the existing pattern for different opcos, environments, and test categories

## Usage

### Basic Test Execution

```bash
# Run all tests
npm test

# Run E2E tests only
npm run test:e2e

# Run integration tests only
npm run test:integration

# Run specific test categories
npm run test:login
npm run test:outages
npm run test:payments
```

### Environment-Specific Testing

```bash
# Run tests on stage environment
npm run test:stage

# Run tests on production environment
npm run test:prod
```

### Advanced Test Execution

```bash
# Run tests with specific tags
npx playwright test --grep @login
npx playwright test --grep @bge
npx playwright test --grep @stage

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Debug tests
npm run test:debug
```

### Parallel Execution Examples

```bash
# Run login tests across all opcos in parallel
npx playwright test --grep @login --workers=6

# Run all tests for a specific opco
npx playwright test --grep @bge

# Run all stage environment tests
npx playwright test --grep @stage
```

## Test Categories

### E2E Tests
- **Login**: Authentication flows, form validation, error handling
- **Outages**: Outage reporting, status updates, map functionality
- **Payments**: Payment processing, scheduling, history viewing

### Integration Tests
- **API**: Backend connectivity, endpoint validation, response format testing

## Credential Management

### Structure
Credentials are stored in `config/credentials.yml` with the following structure:

```yaml
- opco: bge                    # Operating company
  environment: stage           # Environment (stage/production)
  testCategory: login         # Test category
  testName: basic-login      # Optional specific test name
  credentials:
    username: test_user_bge_stage
    password: test_password_bge_stage
```

### Adding New Credentials

1. **Edit `config/credentials.yml`**:
   ```yaml
   - opco: new_opco
     environment: stage
     testCategory: new_category
     credentials:
       username: new_username
       password: new_password
   ```

2. **Use in tests**:
   ```typescript
   const credentials = getTestCredentials('new_opco', 'stage', 'new_category');
   ```

## Test Development

### Creating New Tests

1. **E2E Test Example**:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { BaseTest } from '../../utils/test-base';

   test.describe('New Feature Tests', () => {
     let baseTest: BaseTest;

     test.beforeEach(async ({ page }) => {
       baseTest = new BaseTest({
         opco: 'bge',
         environment: 'stage',
         testCategory: 'new-feature',
         testName: 'test-name'
       });
     });

     test('should test new feature @e2e @new-feature @opco:bge @env:stage', async ({ page }) => {
       // Test implementation
     });
   });
   ```

2. **Integration Test Example**:
   ```typescript
   test('should test API endpoint @integration @api @opco:bge @env:stage', async ({ request }) => {
     const response = await request.get(`${baseUrl}/api/endpoint`);
     expect(response.status()).toBe(200);
   });
   ```

### Test Tagging

Use tags for selective execution:

- `@e2e` - E2E test category
- `@integration` - Integration test category
- `@login`, `@outages`, `@payments` - Functional categories
- `@opco:bge` - Specific opco
- `@env:stage` - Specific environment

## Configuration

### Environment Configuration

Edit `config/environments.ts` to add new opcos or modify URLs:

```typescript
export const ENVIRONMENTS: EnvironmentConfig = {
  stage: [
    {
      name: 'new_opco',
      domain: 'newopco.com',
      stageUrl: 'https://azstage.newopco.com',
      prodUrl: 'https://newopco.com'
    }
  ]
};
```

### Playwright Configuration

- **Main config**: `playwright.config.ts` - Default configuration
- **Stage config**: `playwright.stage.config.ts` - Stage environment
- **Production config**: `playwright.prod.config.ts` - Production environment

## Reports and Artifacts

### Test Reports
- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit Report**: `test-results/results.xml`

### Screenshots and Videos
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/`
- **Traces**: `test-results/traces/`

## Security Considerations

### Credential Security
- **Never commit real credentials** to version control
- **Use environment variables** for sensitive data in production
- **Rotate credentials regularly**
- **Use different credentials** for different test categories

### Best Practices
- **Tag tests appropriately** for selective execution
- **Use data-testid selectors** for reliable element selection
- **Take screenshots** on failures for debugging
- **Handle errors gracefully** in tests

## Troubleshooting

### Common Issues

1. **Tests failing due to missing credentials**:
   - Check `config/credentials.yml` for the specific opco/environment/category
   - Add missing credentials following the existing pattern

2. **Tests failing due to incorrect URLs**:
   - Verify opco configuration in `config/environments.ts`
   - Check that the opco exists for the target environment

3. **Tests not running in parallel**:
   - Ensure `fullyParallel: true` in Playwright config
   - Check that tests don't have conflicting dependencies

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test --debug --grep "test name"
```

## Contributing

1. **Follow the existing patterns** for test structure and naming
2. **Add appropriate tags** to new tests
3. **Update credentials** when adding new test categories
4. **Document new features** in this README

## Support

For questions or issues:
1. Check the test logs and reports
2. Review the configuration files
3. Verify credentials and environment settings
4. Check Playwright documentation for advanced features

---

**Note**: This framework is designed to be flexible and scalable. Add new opcos, environments, or test categories by following the existing patterns in the configuration files. 