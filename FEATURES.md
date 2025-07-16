This project currently has a basic automated testing framework set up. This framework is used for testing the sites described in CONTEXT.md.

First, analyze the current project structure and read all the documentation. Pay specific attention to:
- credential management (how secrets in azure keyvault and local credentials are generated and consumed; credentials files should be scoped to environments; there will be one keyvault per environment)
- test data managmgent
- running tests in ci pipeline (azure devops and/or github)
- test tagging and annotations


I want to be able to re-use some of these tests for different sites. They currently only seem to be able to be designated for one site at a time, meaning that id have to duplicate the code if I wanted to run this for multiple sites.

Can we make this so we can run a test for one or many sites? Depending on white site the test was running on, the framework would grab the right credentials for that site and run the test

## ✅ IMPLEMENTED: Multi-Opco Testing Framework

The framework now supports running tests across multiple opcos (sites) without code duplication. Here's what has been implemented:

### 🎯 Key Features
- **Multi-Opco Test Runner**: Run the same test logic across all 6 opcos automatically
- **Dynamic Credential Resolution**: Automatically grab the right credentials for each opco
- **Flexible Opco Selection**: Test all opcos, specific opcos, or exclude certain opcos
- **Test Templates**: Easy-to-use templates for creating consistent multi-opco tests
- **Environment Support**: Works across both stage and production environments
- **CI Integration**: Updated Azure pipeline to support multi-opco testing

### 🛠️ How to Use

#### 1. Basic Multi-Opco Test
```typescript
import { MultiOpcoTestRunner, createMultiOpcoTestRunner } from '../../utils/multi-opco-test-runner';

test('should test feature across all opcos @e2e @multi-opco @env:stage', async ({ page }) => {
  const multiOpcoRunner = createMultiOpcoTestRunner({
    environment: 'stage',
    testCategory: 'login'
  });

  const opcosToTest = multiOpcoRunner.getOpcosToTest();
  
  for (const opco of opcosToTest) {
    const context = multiOpcoRunner.createOpcoTestContext(opco);
    // Test implementation - automatically uses correct credentials and URLs
  }
});
```

#### 2. Using Test Templates
```typescript
import { createE2ETestTemplate } from '../../utils/test-templates';

createE2ETestTemplate(
  'should test feature across all opcos @e2e @multi-opco @env:stage',
  async (context, page) => {
    // Test implementation
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);
```

#### 3. Testing Specific Opcos
```typescript
createE2ETestTemplate(
  'should test specific opcos @e2e @multi-opco @env:stage',
  async (context, page) => {
    // Test implementation
  },
  {
    environment: 'stage',
    testCategory: 'login',
    opcos: ['bge', 'comed', 'peco'] // Only test these opcos
  }
);
```

### 🚀 Running Multi-Opco Tests

```bash
# Run all multi-opco tests
npm run test:multi-opco

# Run multi-opco tests for specific environment
npm run test:multi-opco:stage
npm run test:multi-opco:prod

# Run in CI mode
npm run test:multi-opco:stage:ci
npm run test:multi-opco:prod:ci
```

### 📁 New Files Created
- `utils/multi-opco-test-runner.ts` - Core multi-opco testing functionality
- `utils/test-templates.ts` - Templates for easy test creation
- `tests/e2e/multi-opco-login.spec.ts` - Example multi-opco E2E tests
- `tests/integration/multi-opco-api.spec.ts` - Example multi-opco API tests
- `tests/e2e/template-example.spec.ts` - Examples using test templates

### 🔧 Updated Files
- `package.json` - Added multi-opco test scripts
- `azure-pipelines.yml` - Added multi-opco test execution
- `README.md` - Updated documentation with multi-opco examples

### 🎉 Benefits
- **No Code Duplication**: Write test logic once, run across all opcos
- **Automatic Credential Management**: Framework handles opco-specific credentials
- **Flexible Execution**: Test all opcos, specific opcos, or exclude certain ones
- **Consistent Patterns**: Templates ensure consistent test structure
- **CI/CD Ready**: Integrated with Azure pipeline for automated testing
