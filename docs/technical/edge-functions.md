# Edge Functions Guide

This guide covers everything you need to know about working with Supabase Edge Functions in LaunchLab.

# LaunchLab Edge Functions Implementation

## Current Edge Functions

### 1. Report Generation (`/supabase/functions/generate-report/index.ts`)

Our primary edge function that generates comprehensive business idea analysis reports using OpenAI's gpt-4o-mini-2024-07-18 model.

#### Key Features

- OpenAI integration with structured outputs
- Error handling and retries
- Rate limiting
- Input validation
- Response processing

#### Implementation Details

```typescript
// OpenAI Configuration
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

// Function call structure
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini-2024-07-18',
  messages: messages,
  functions: [functionSchema],
  function_call: { name: 'generate_report' },
});
```

#### Error Handling

- Model refusal handling
- Rate limit management
- Timeout handling
- Input validation

#### Best Practices

1. Always use structured outputs
2. Initialize empty arrays/objects for nullable fields
3. Implement proper error handling
4. Log important events
5. Validate all inputs

#### Making Changes

1. Update function schema to match Report interface
2. Test with sample inputs
3. Verify error handling
4. Check response processing
5. Update database operations

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Creating and Running Functions](#creating-and-running-functions)
3. [Configuration and Best Practices](#configuration-and-best-practices)
4. [Testing Edge Functions](#testing-edge-functions)
5. [Logging and Monitoring](#logging-and-monitoring)
6. [Deployment](#deployment)

## Initial Setup

### Prerequisites

- Deno CLI installed
- Supabase CLI installed
- VS Code with Deno extension (recommended)
- `.env.local` configured with correct endpoints

### Project Structure

```
└── supabase
    ├── functions
    │   ├── import_map.json    # Shared imports across functions
    │   ├── _shared           # Shared code
    │   │   ├── supabaseAdmin.ts
    │   │   ├── supabaseClient.ts
    │   │   └── cors.ts
    │   ├── function-one     # Individual functions
    │   │   └── index.ts
    │   └── tests           # Test files
    │       └── function-one-test.ts
    └── config.toml
```

## Creating and Running Functions

### Creating a New Function

```bash
supabase functions new my-function-name
```

### Basic Function Structure

```typescript
Deno.serve(async req => {
  const { name } = await req.json();
  const data = {
    message: `Hello ${name}!`,
  };
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Running Functions Locally

```bash
supabase start    # Start local Supabase stack
supabase functions serve   # Serve functions with hot-reloading
```

### Testing Functions Locally

```bash
curl --request POST 'http://localhost:54321/functions/v1/my-function-name' \
  --header 'Authorization: Bearer SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{ "name":"Test" }'
```

## Configuration and Best Practices

### Environment Variables

- Store in `supabase/functions/.env`
- Keep separate from root `.env.local`
- Structure:
  ```env
  OPENAI_API_KEY=your_key
  SUPABASE_URL=your_local_url
  SUPABASE_ANON_KEY=your_local_key
  ```

### Function Configuration

```toml
[functions.my-function-name]
verify_jwt = false  # Skip JWT verification if needed
import_map = './import_map.json'
```

### Development Tips

- Use `--no-verify-jwt` flag for webhook endpoints
- Use hyphens in function names for URL-friendliness
- Support for GET, POST, PUT, PATCH, DELETE, and OPTIONS methods
- HTML content is not supported (returns as text/plain)

### Error Handling

```typescript
import {
  FunctionsHttpError,
  FunctionsRelayError,
  FunctionsFetchError,
} from '@supabase/supabase-js';

try {
  // Your function code
} catch (error) {
  if (error instanceof FunctionsHttpError) {
    const errorMessage = await error.context.json();
    console.log('Function error:', errorMessage);
  }
}
```

## Testing Edge Functions

### Test Setup

1. Create a dedicated test directory
2. Set up test environment variables
3. Use Deno's built-in testing framework

### Example Test

```typescript
import { assertEquals } from 'https://deno.land/std@0.192.0/testing/asserts.ts';
import { createClient } from '@supabase/supabase-js';

Deno.test('my-function test', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/my-function', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'Test' }),
  });

  const data = await response.json();
  assertEquals(data.message, 'Hello Test!');
});
```

## Logging and Monitoring

### Structured Logging

```typescript
const logger = {
  info: (message: string, data?: any) => {
    console.log(
      JSON.stringify({
        level: 'info',
        message,
        data,
        timestamp: new Date().toISOString(),
      })
    );
  },
  error: (message: string, error?: any) => {
    console.error(
      JSON.stringify({
        level: 'error',
        message,
        error: error?.message || error,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
      })
    );
  },
};
```

### Best Practices

1. Use structured logging
2. Include request IDs for tracing
3. Log important events and errors
4. Don't log sensitive information
5. Use appropriate log levels

## Deployment

### GitHub Actions Workflow

```yaml
name: Deploy Edge Function

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Deploy Function
        run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### Security Considerations

1. Use environment secrets in GitHub Actions
2. Never commit sensitive keys
3. Use appropriate access controls
4. Implement rate limiting where necessary
5. Validate all inputs
