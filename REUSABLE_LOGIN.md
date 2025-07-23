# Reusable Login Flow for Multi-Opco Testing

This document explains how to use the reusable login flow feature that allows you to perform login once and reuse the authenticated state across multiple tests without re-running login steps.

## 🎯 Overview

The reusable login flow provides:
- **Performance**: Login once, run many tests
- **Efficiency**: No duplicate login steps across tests
- **Flexibility**: Choose when to use shared state vs fresh login
- **Reliability**: Automatic state validation and fallback

## 🚀 Quick Start

### Basic Usage

```typescript
import { generateOpcoTest } from '../../utils/test-generator';

// Test 1: Initial login (stores state)
generateOpcoTest(
  'should login and store state',
  async (context, page) => {
    // Login is automatically handled
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  },
  {
    credentialId: 'login',
    requiresLogin: true // Triggers login and stores state
  }
);

// Test 2: Follow-up test (uses stored state)
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

## 📋 Login Options

### `requiresLogin: true`
- Performs fresh login
- Stores login state (cookies + localStorage + sessionStorage)
- Use for initial login tests or when you need fresh authentication

### `useSharedLogin: true`
- Uses stored login state if available
- Falls back to fresh login if stored state is invalid/expired
- Use for follow-up tests that need authentication

### No login option
- No authentication required
- Uses anonymous URLs
- Use for public page tests

## 🔧 Advanced Usage

### Test Suites with Shared Login

```typescript
import { generateOpcoTestSuite } from '../../utils/test-generator';

const authenticatedTests = [
  {
    name: 'should view dashboard',
    function: async (context, page) => {
      await page.goto(context.secureBaseUrl + '/dashboard');
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    }
  },
  {
    name: 'should view billing',
    function: async (context, page) => {
      await page.goto(context.secureBaseUrl + '/billing');
      await expect(page.locator('[data-testid="billing"]')).toBeVisible();
    }
  }
];

generateOpcoTestSuite(
  'Authenticated User Workflow',
  authenticatedTests,
  {
    credentialId: 'login',
    useSharedLogin: true // All tests use same login state
  }
);
```

### Manual Login State Management

```typescript
import { 
  performLoginAndStoreState, 
  clearStoredLoginState,
  ensureLoggedIn 
} from '../../utils/test-generator';

// Manual login with state storage
generateOpcoTest(
  'should manually handle login state',
  async (context, page) => {
    // Perform login and store state
    await performLoginAndStoreState(context, page);
    
    // Your test logic here
    await page.goto(context.secureBaseUrl + '/admin');
    
    // Clear state when done
    clearStoredLoginState(context.opco);
  },
  {
    credentialId: 'login'
  }
);
```

### Environment-Specific Login Tests

```typescript
// Stage-only tests with shared login
generateOpcoTest(
  'should test stage features',
  async (context, page) => {
    await page.goto(context.secureBaseUrl + '/stage-features');
    await expect(page.locator('[data-testid="stage-features"]')).toBeVisible();
  },
  {
    environment: 'stage',
    credentialId: 'login',
    useSharedLogin: true
  }
);

// Production-only tests with shared login
generateOpcoTest(
  'should test production features',
  async (context, page) => {
    await page.goto(context.secureBaseUrl + '/production-features');
    await expect(page.locator('[data-testid="production-features"]')).toBeVisible();
  },
  {
    environment: 'production',
    credentialId: 'login',
    useSharedLogin: true
  }
);
```

## 🔄 How It Works

### State Storage
- **Cookies**: Session cookies are stored and restored
- **localStorage**: Browser localStorage is captured and restored
- **sessionStorage**: Browser sessionStorage is captured and restored
- **Key**: State is stored per opco + environment combination

### State Validation
- When using stored state, the framework validates it's still valid
- If validation fails, it automatically performs fresh login
- Invalid states are automatically cleared

### State Cleanup
- Use `clearStoredLoginState()` to manually clear state
- State is automatically cleared when tests complete
- State is isolated per opco and environment

## 📝 Best Practices

### 1. Test Organization
```typescript
// ✅ Good: Clear separation of concerns
generateOpcoTest('should login', async (context, page) => {
  // Login verification only
}, { requiresLogin: true });

generateOpcoTest('should access profile', async (context, page) => {
  // Profile testing only
}, { useSharedLogin: true });
```

### 2. State Management
```typescript
// ✅ Good: Clear state when needed
generateOpcoTest('should perform sensitive operation', async (context, page) => {
  // Sensitive operation
  await performSensitiveOperation(page);
  
  // Clear state after sensitive operation
  clearStoredLoginState(context.opco);
}, { requiresLogin: true });
```

### 3. Error Handling
```typescript
// ✅ Good: Handle login failures gracefully
generateOpcoTest('should handle login failure', async (context, page) => {
  try {
    await ensureLoggedIn(context, page);
  } catch (error) {
    console.log('Login failed, continuing with anonymous flow');
    await page.goto(context.baseUrl);
  }
}, { useSharedLogin: true });
```

## 🚨 Important Notes

### State Persistence
- Login state persists only within the same test run
- State is cleared between different test runs
- State is isolated per opco and environment

### Security Considerations
- Stored state includes sensitive authentication data
- Clear state after sensitive operations
- Don't store state for admin/superuser accounts

### Performance Impact
- First test with `requiresLogin: true` will be slower
- Subsequent tests with `useSharedLogin: true` will be faster
- State validation adds minimal overhead

## 🔍 Debugging

### Enable Debug Logging
```typescript
// Add to your test to see login state operations
console.log('Login state operations will be logged automatically');
```

### Check Stored State
```typescript
import { getCurrentOpcoList } from '../../utils/test-generator';

// Check which opcos are being tested
console.log('Current opco list:', getCurrentOpcoList());
```

### Manual State Inspection
```typescript
// In your test, you can inspect the current state
const cookies = await page.context().cookies();
console.log('Current cookies:', cookies);
```

## 📚 Examples

See the following files for complete examples:
- `tests/e2e/reusable-login-examples.spec.ts` - Comprehensive examples
- `tests/e2e/unified-test-examples.spec.ts` - Updated with login examples

## 🎯 Common Use Cases

### 1. User Journey Testing
```typescript
// Login once, test entire user journey
generateOpcoTest('should complete user journey', async (context, page) => {
  // Login is handled automatically
  await page.goto(context.secureBaseUrl + '/dashboard');
  await page.goto(context.secureBaseUrl + '/profile');
  await page.goto(context.secureBaseUrl + '/billing');
  await page.goto(context.secureBaseUrl + '/preferences');
}, { useSharedLogin: true });
```

### 2. API Testing with Authentication
```typescript
// API tests can also use shared login state
generateOpcoAPITest('should access authenticated API', async (context, request) => {
  const response = await request.get(context.secureBaseUrl + '/api/user');
  expect(response.status()).toBe(200);
}, { useSharedLogin: true });
```

### 3. Mixed Authentication Requirements
```typescript
// Some tests require login, others don't
generateOpcoTest('should view public page', async (context, page) => {
  await page.goto(context.baseUrl); // Anonymous URL
}, { credentialId: 'login' }); // No login required

generateOpcoTest('should view private page', async (context, page) => {
  await page.goto(context.secureBaseUrl + '/private'); // Secure URL
}, { useSharedLogin: true }); // Uses stored login state
``` 