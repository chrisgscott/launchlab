# Testing Guide

This guide covers testing strategies and practices for LaunchLab.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Types](#test-types)
3. [Edge Function Testing](#edge-function-testing)
4. [Frontend Testing](#frontend-testing)
5. [Database Testing](#database-testing)
6. [CI/CD Integration](#cicd-integration)

## Testing Strategy

### Test Pyramid

1. Unit Tests (70%)
   - Individual components
   - Utility functions
   - Hooks
2. Integration Tests (20%)
   - API endpoints
   - Database operations
   - Component interactions
3. End-to-End Tests (10%)
   - User flows
   - Critical paths
   - System integration

### Test Organization

```
project-root/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── components/
│   └── __tests__/
└── supabase/
    └── functions/
        └── tests/
```

## Test Types

### Unit Tests

```typescript
// components/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <Button onClick={onClick}>Click Me</Button>
    )

    fireEvent.click(getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/api.test.ts
import { createClient } from '@supabase/supabase-js';

describe('API Integration', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  it('creates and retrieves a record', async () => {
    const { data: created } = await supabase
      .from('test_table')
      .insert({ name: 'test' })
      .select()
      .single();

    expect(created).toHaveProperty('name', 'test');

    const { data: retrieved } = await supabase
      .from('test_table')
      .select()
      .eq('id', created.id)
      .single();

    expect(retrieved).toEqual(created);
  });
});
```

### E2E Tests

```typescript
// __tests__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="sign-in-button"]');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="submit-button"]');

  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

## Edge Function Testing

### Test Setup

```typescript
// supabase/functions/tests/setup.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.test' });

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);
```

### Function Tests

```typescript
// supabase/functions/tests/my-function.test.ts
import { assertEquals } from 'https://deno.land/std@0.192.0/testing/asserts.ts';
import { supabase } from './setup.ts';

Deno.test('my-function', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/my-function', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ test: true }),
  });

  const data = await response.json();
  assertEquals(response.status, 200);
  assertEquals(data.success, true);
});
```

### Mocking

```typescript
// supabase/functions/tests/mocks.ts
export const mockSupabaseClient = {
  from: (table: string) => ({
    select: () => ({
      data: [{ id: 1, name: 'test' }],
      error: null,
    }),
    insert: () => ({
      data: { id: 1, name: 'test' },
      error: null,
    }),
  }),
};
```

## Frontend Testing

### Component Testing

```typescript
// components/__tests__/Form.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Form } from '../Form'

describe('Form', () => {
  it('validates input', async () => {
    const { getByRole, getByText } = render(<Form />)

    fireEvent.click(getByRole('button'))

    await waitFor(() => {
      expect(getByText('This field is required')).toBeInTheDocument()
    })
  })
})
```

### Hook Testing

```typescript
// hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('handles sign in', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.user).toBeTruthy();
  });
});
```

## Database Testing

### Setup and Teardown

```typescript
// __tests__/helpers/db.ts
import { supabase } from '@/lib/supabase';

export async function setupTestDb() {
  await supabase.from('test_table').delete().neq('id', 0);
}

export async function teardownTestDb() {
  await supabase.from('test_table').delete().neq('id', 0);
}
```

### Database Tests

```typescript
// __tests__/db/users.test.ts
import { setupTestDb, teardownTestDb } from '../helpers/db';
import { createUser, getUser } from '@/lib/db';

describe('User Database Operations', () => {
  beforeEach(setupTestDb);
  afterEach(teardownTestDb);

  it('creates and retrieves a user', async () => {
    const user = await createUser({
      email: 'test@example.com',
      name: 'Test User',
    });

    const retrieved = await getUser(user.id);
    expect(retrieved).toEqual(user);
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install Dependencies
        run: pnpm install

      - name: Run Tests
        run: pnpm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### Test Coverage

```json
// jest.config.js
{
  "collectCoverage": true,
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Best Practices

1. Write tests before code (TDD)
2. Keep tests focused and isolated
3. Use meaningful test descriptions
4. Mock external dependencies
5. Maintain test data fixtures
6. Regular test maintenance
7. Monitor test coverage
8. Automate test runs
