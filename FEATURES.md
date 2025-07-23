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
- **Unified Test Generator**: Single function for all test scenarios with intelligent defaults
- **Dynamic Credential Resolution**: Automatically grab the right credentials for each opco
- **Flexible Environment Selection**: Test in stage, production, or both environments
- **Flexible Opco Selection**: Test all opcos, specific opcos, or exclude certain opcos
- **Intelligent Defaults**: No configuration needed for common scenarios
- **Environment Support**: Works across both stage and production environments
- **CI Integration**: Updated Azure pipeline to support multi-opco testing
- **Consistent Naming**: Uses short names in code, full names in URLs
- **Reusable Login Flow**: Login once, reuse authenticated state across multiple tests

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

# Environment-specific testing
npm run test:env:stage
npm run test:env:prod
npm run test:env:stage:login
npm run test:env:prod:ace

# Custom opco and environment selection
npx cross-env TEST_ENVIRONMENT=stage OPCO_LIST=bge,com,pec npx playwright test tests/e2e/generated-login.spec.ts
npx cross-env TEST_ENVIRONMENT=production OPCO_SKIP=ace,dpl npx playwright test tests/e2e/generated-login.spec.ts
```

#### 2. Using Unified Test Generator (Recommended)
```typescript
import { generateOpcoTest } from '../../utils/test-generator';

// Example 1: Default behavior - runs in both environments for all opcos
generateOpcoTest(
  'should successfully login with valid credentials',
  async (context, page) => {
    // Test implementation - automatically uses correct credentials and URLs
    await page.goto(`${context.secureBaseUrl}/accounts/login`);
    await page.fill('[data-di-id="#signInName"]', context.credentials.username);
    // ... rest of test
  },
  {
    testCategory: 'login'
    // No environment specified = runs in both stage and production
    // No opcos specified = uses OPCO_LIST/OPCO_SKIP logic
  }
);

// Example 2: Stage-only test
generateOpcoTest(
  'should run only in stage environment',
  async (context, page) => {
    // Test implementation
  },
  {
    environment: 'stage', // Only runs in stage
    testCategory: 'login'
  }
);

// Example 3: Specific opcos only
generateOpcoTest(
  'should run only for ace and bge',
  async (context, page) => {
    // Test implementation
  },
  {
    opcos: ['ace', 'bge'], // Only runs for ace and bge
    testCategory: 'login'
    // No environment specified = runs in both environments
  }
);

// Example 4: Stage + specific opcos
generateOpcoTest(
  'should run in stage for com and pec',
  async (context, page) => {
    // Test implementation
  },
  {
    environment: 'stage', // Only runs in stage
    opcos: ['com', 'pec'], // Only runs for com and pec
    credentialId: 'login'
  }
);

// Example 5: Reusable login flow
generateOpcoTest(
  'should login and store state',
  async (context, page) => {
    // Login is automatically handled and state is stored
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  },
  {
    credentialId: 'login',
    requiresLogin: true // Triggers login and stores state
  }
);

generateOpcoTest(
  'should access profile without re-login',
  async (context, page) => {
    await page.goto(context.secureBaseUrl + '/profile');
    await expect(page.locator('[data-testid="profile"]')).toBeVisible();
  },
  {
    credentialId: 'login',
    useSharedLogin: true // Uses stored login state
  }
);
```

#### 3. Environment and Opco Selection Logic

**Environment Selection:**
- If no `environment` specified → runs in both stage and production
- If `environment: 'stage'` → runs only in stage
- If `environment: 'production'` → runs only in production  
- If `environment: ['stage', 'production']` → runs in both (explicit)
- If `TEST_ENVIRONMENT` env var set → overrides to single environment

**Opco Selection:**
- If no `opcos` specified → uses `OPCO_LIST`/`OPCO_SKIP` logic
- If `opcos: ['ace', 'bge']` → runs only for specified opcos
- If `OPCO_LIST` env var set → overrides to specific opcos
- If `OPCO_SKIP` env var set → excludes specific opcos

**Priority Order:**
1. Explicit `environment`/`opcos` in test options (highest)
2. Environment variables (`TEST_ENVIRONMENT`, `OPCO_LIST`, `OPCO_SKIP`)
3. Default behavior (both environments, all opcos)

**Login Flow Options:**
- `requiresLogin: true` - Performs fresh login and stores state
- `useSharedLogin: true` - Uses stored login state if available, falls back to fresh login
- No login option - No authentication required (uses anonymous URLs)

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
- `utils/test-generator.ts` - Unified test generator with intelligent defaults
- `tests/e2e/generated-login.spec.ts` - Example generated multi-opco E2E tests
- `tests/integration/generated-api.spec.ts` - Example generated multi-opco API tests
- `tests/e2e/unified-test-examples.spec.ts` - Examples of unified test generator usage
- `tests/e2e/reusable-login-examples.spec.ts` - Examples of reusable login flow
- `REUSABLE_LOGIN.md` - Comprehensive documentation for reusable login flow

### 🔧 Updated Files
- `tests/e2e/opco-specific-tests.spec.ts` - Updated to use unified approach
- `tests/e2e/environment-specific-tests.spec.ts` - Updated to use unified approach
- `utils/test-generator.ts` - Added reusable login flow functionality
- `tests/e2e/unified-test-examples.spec.ts` - Updated with login examples

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
- **Reusable Login Flow**: Login once, reuse authenticated state across multiple tests
