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
- **Test Generator**: Dynamically generate separate test instances for each opco
- **Dynamic Credential Resolution**: Automatically grab the right credentials for each opco
- **Flexible Opco Selection**: Test all opcos, specific opcos, or exclude certain opcos
- **Opco-Specific Test Tagging**: Run tests only for specific opcos regardless of OPCO_LIST
- **All-Opcos Test Tagging**: Run tests for all opcos regardless of OPCO_LIST
- **Environment Support**: Works across both stage and production environments
- **CI Integration**: Updated Azure pipeline to support multi-opco testing
- **Consistent Naming**: Uses short names in code, full names in URLs

### 📋 Opco Name Mapping
| Short Name | Full Name | Domain |
|------------|-----------|---------|
| `bge` | BGE | bge.com |
| `com` | ComEd | comed.com |
| `pec` | PECO | peco.com |
| `ace` | Atlantic City Electric | atlanticcityelectric.com |
| `dpl` | Delmarva | delmarva.com |
| `pep` | PEPCO | pepco.com |

### 🛠️ How to Use

#### 1. Command Line Driven Testing
The framework now uses environment variables to control which opcos to test:

```bash
# Test specific opcos (using short names)
npm run test:login:bge
npm run test:login:bge,com
npm run test:api:bge

# Test all opcos for an environment
npm run test:login:stage
npm run test:api:prod

# Custom opco selection
npx cross-env OPCO_LIST=bge,com,pec npx playwright test tests/e2e/generated-login.spec.ts
npx cross-env OPCO_SKIP=ace,dpl npx playwright test tests/e2e/generated-login.spec.ts
```

#### 2. Using Test Generator (Recommended)
```typescript
import { generateOpcoTest } from '../../utils/test-generator';

// This creates separate tests for each opco specified in OPCO_LIST
generateOpcoTest(
  'should successfully login with valid credentials',
  async (context, page) => {
    // Test implementation - automatically uses correct credentials and URLs
    await page.goto(`${context.secureBaseUrl}/accounts/login`);
    await page.fill('[data-di-id="#signInName"]', context.credentials.username);
    // ... rest of test
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);
```

#### 3. Opco-Specific Test Tagging
```typescript
import { generateOpcoSpecificTest } from '../../utils/test-generator';

// This test runs ONLY for ace and bge, regardless of OPCO_LIST
generateOpcoSpecificTest(
  'should run only for ace and bge',
  async (context, page) => {
    // Test implementation - runs only for specified opcos
    await page.goto(context.baseUrl);
    
    // Add opco-specific logic
    if (context.opco === 'ace') {
      console.log('Running ACE-specific logic');
    } else if (context.opco === 'bge') {
      console.log('Running BGE-specific logic');
    }
  },
  {
    environment: 'stage',
    testCategory: 'login',
    opcos: ['ace', 'bge']  // Only these opcos
  }
);
```

#### 4. All-Opcos Test Tagging
```typescript
import { generateAllOpcosTest } from '../../utils/test-generator';

// This test runs for ALL opcos, regardless of OPCO_LIST
generateAllOpcosTest(
  'should run for all opcos',
  async (context, page) => {
    // Test implementation - runs for all opcos
    await page.goto(context.baseUrl);
  },
  {
    environment: 'stage',
    testCategory: 'login'
  }
);
```

#### 3. Legacy Tests (Updated)
Existing tests now respect the OPCO_LIST environment variable:
```typescript
// Old tests automatically use the first opco from OPCO_LIST
// or default to their original opco if OPCO_LIST is not set
test('should login @e2e @login @env:stage', async ({ page }) => {
  // Test implementation
});
```

### 🚀 Running Multi-Opco Tests

```bash
# Run tests for specific opcos (using short names)
npm run test:login:bge
npm run test:login:bge,com
npm run test:api:bge

# Run tests for all opcos in an environment
npm run test:login:stage
npm run test:api:prod

# Run in CI mode
npm run test:login:stage:ci
npm run test:api:prod:ci

# Custom opco selection
npx cross-env OPCO_LIST=bge,com,pec npx playwright test --grep @login
npx cross-env OPCO_SKIP=ace,dpl npx playwright test --grep @api
```

### 📁 New Files Created
- `utils/test-generator.ts` - Core multi-opco testing functionality with opco-specific tagging
- `tests/e2e/generated-login.spec.ts` - Example generated multi-opco E2E tests
- `tests/integration/generated-api.spec.ts` - Example generated multi-opco API tests
- `tests/e2e/opco-specific-tests.spec.ts` - Examples of opco-specific test tagging

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
