# Technical Reference Guide (Archived)

> **Important**: This documentation has been reorganized into separate, focused guides. Please refer to the [main documentation index](./index.md) for the current documentation.

## Documentation Structure

The technical documentation has been split into the following guides for better organization and maintainability:

- [Edge Functions Guide](./edge-functions.md) - Setup, creation, testing, and deployment of Edge Functions
- [Database Guide](./database.md) - Database setup, access patterns, and best practices
- [Environment Setup](./environment-setup.md) - Environment variables and configuration
- [Local Development Guide](./local-development.md) - Getting started with local development
- [Testing Guide](./testing.md) - Testing strategies and implementation
- [Background Tasks](./background-tasks.md) - Async operations and task management
- [Deployment Guide](./deployment.md) - CI/CD and production deployment
- [Monitoring Guide](./monitoring.md) - Observability and logging
- [Security Guide](./security.md) - Authentication, authorization, and security practices

Please update your bookmarks to use the new guides above. This file is maintained for historical reference only.

---

> Note: The content below is archived and may be outdated. Please refer to the specific guides above for current information.

## Quick Links

- [Edge Functions Guide](./edge-functions.md)
- [Database Guide](./database.md)
- [Environment Setup](./environment-setup.md)
- [Local Development Guide](./local-development.md)
- [Testing Guide](./testing.md)
- [Background Tasks](./background-tasks.md)
- [Deployment Guide](./deployment.md)
- [Monitoring Guide](./monitoring.md)
- [Security Guide](./security.md)

This reorganization helps maintain clearer, more focused documentation for each aspect of the system. Please update your bookmarks accordingly.

## Table of Contents

1. [Local Development Setup](#local-development-setup)

   - [Edge Functions](#edge-functions)
     - [Initial Setup](#initial-setup)
     - [Creating and Running Functions](#creating-and-running-functions)
     - [Configuration and Best Practices](#configuration-and-best-practices)
   - [Database Access](#database-access)
     - [Connection Setup](#connection-setup)
     - [Best Practices](#database-best-practices)

2. [Environment Variables](#environment-variables)

   - [Default Supabase Secrets](#default-supabase-secrets)
   - [Local Development](#env-local-development)
   - [Production Setup](#production-setup)
   - [Best Practices](#env-best-practices)

3. [Database Connectivity](#database-connectivity)

   - [Supabase Client](#using-supabase-client)
   - [Direct Postgres](#direct-postgres-connection)
   - [Using Drizzle ORM](#using-drizzle-orm)
   - [SSL Configuration](#ssl-configuration)

4. [Background Tasks](#background-tasks)

   - [Basic Implementation](#basic-implementation)
   - [Local Development Setup](#background-local-setup)
   - [Best Practices](#background-best-practices)
   - [Error Handling](#background-error-handling)

5. [Continuous Deployment](#continuous-deployment)

   - [GitHub Actions Setup](#github-actions-setup)
   - [Environment Setup](#cd-environment-setup)
   - [Best Practices](#cd-best-practices)

6. [Testing Edge Functions](#testing-edge-functions)

   - [Project Structure](#test-project-structure)
   - [Test Setup](#test-setup)
   - [Running Tests](#running-tests)
   - [Advanced Testing](#advanced-testing)

7. [Logging and Monitoring](#logging-and-monitoring)
   - [Logging Types](#logging-types)
   - [Request Header Logging](#request-header-logging)
   - [Structured Logging](#structured-logging)
   - [Best Practices](#logging-best-practices)

## Local Development Setup

### Edge Functions

#### Initial Setup

1. **Prerequisites**

   - Deno CLI installed
   - Supabase CLI installed
   - VS Code with Deno extension (recommended)
   - `.env.local` configured with correct endpoints

2. **Project Initialization**

   ```bash
   supabase init
   ```

   - For VS Code users: Select `y` when prompted "Generate VS Code settings for Deno?"
   - For IntelliJ/WebStorm users: Use `--with-intellij-settings` flag

3. **Project Structure**
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

#### Creating and Running Functions

1. **Creating a New Function**

   ```bash
   supabase functions new my-function-name
   ```

2. **Basic Function Structure**

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

3. **Running Functions Locally**

   ```bash
   supabase start    # Start local Supabase stack
   supabase functions serve   # Serve functions with hot-reloading
   ```

4. **Testing Functions Locally**
   ```bash
   # Using cURL
   curl --request POST 'http://localhost:54321/functions/v1/my-function-name' \
     --header 'Authorization: Bearer SUPABASE_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{ "name":"Test" }'
   ```

#### Configuration and Best Practices

1. **Environment Variables**

   - Store in `supabase/functions/.env`
   - Keep separate from root `.env.local`
   - Structure:
     ```env
     OPENAI_API_KEY=your_key
     SUPABASE_URL=your_local_url
     SUPABASE_ANON_KEY=your_local_key
     ```

2. **Function Configuration (config.toml)**

   ```toml
   [functions.my-function-name]
   verify_jwt = false  # Skip JWT verification if needed
   import_map = './import_map.json'
   ```

3. **Development Tips**

   - Use `--no-verify-jwt` flag for webhook endpoints
   - Use hyphens in function names for URL-friendliness
   - Support for GET, POST, PUT, PATCH, DELETE, and OPTIONS methods
   - HTML content is not supported (returns as text/plain)

4. **Error Handling**

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

5. **Common Issues**
   - CORS errors: Check `_shared/cors.ts` configuration
   - Authentication: Verify JWT tokens
   - Environment variables: Check file location and format
   - Database access: Verify connection strings and permissions

#### Database Access

1. **Connection Setup**

   - Use `createClient` from `@supabase/supabase-js`
   - Different configurations needed for:
     - Server-side (Edge functions)
     - Client-side (Browser)
     - API routes

2. **Connection Examples**

   ```typescript
   // Client-side
   import { createClient } from '@/libs/supabase/client';
   const supabase = createClient();

   // Server-side (Edge Functions)
   import { createClient } from '@supabase/supabase-js';
   const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

   // API Routes
   import { createClient } from '@/libs/supabase/server';
   const supabase = createClient();
   ```

3. **Common Issues**
   - Connection refused: Check if Supabase is running locally
   - Authentication errors: Verify correct keys in `.env.local`
   - CORS issues: Check database security policies

## Environment Variables

#### Structure

1. **Root Level** (`.env.local`)

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key

   # OpenAI
   OPENAI_API_KEY=your_key
   OPENAI_MODEL=gpt-4o-mini-2024-07-18  # DO NOT CHANGE

   # Email
   MAILGUN_API_KEY=your_key
   MAILGUN_DOMAIN=your_domain
   ```

2. **Edge Functions** (`supabase/functions/.env`)
   ```env
   OPENAI_API_KEY=your_key
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   ```

#### Best Practices

1. **Variable Naming**

   - Use `NEXT_PUBLIC_` prefix for client-side variables
   - Keep sensitive keys server-side only
   - Use descriptive names (e.g., `MAILGUN_API_KEY` not `MG_KEY`)

2. **Security**

   - Never commit `.env` files to Git
   - Keep service role key strictly server-side
   - Rotate keys if accidentally exposed

3. **Debugging**
   - Check both root and edge function `.env` files
   - Verify variable names match exactly
   - Restart servers after env changes

## Deployment Considerations

1. **Edge Functions**

   - Deploy using `supabase functions deploy function-name`
   - Set production env vars in Supabase dashboard
   - Test thoroughly with production endpoints

2. **Environment Variables**

   - Set production variables in Vercel dashboard
   - Ensure all required variables are set
   - Double-check sensitive key permissions

3. **Database**
   - Update security policies for production
   - Check RLS policies
   - Verify proper role-based access

## Common Troubleshooting

### Edge Function Issues

1. **Function not found**

   - Check function name matches deployment
   - Verify function is deployed (`supabase functions list`)
   - Check function URL construction

2. **CORS Errors**

   - Update CORS configuration in function
   - Check request headers
   - Verify origin settings

3. **Authentication Failed**
   - Check JWT token passing
   - Verify environment variables
   - Check user permissions

### Database Issues

1. **Connection Failed**

   - Verify Supabase is running locally
   - Check connection strings
   - Confirm network access

2. **Query Errors**

   - Check RLS policies
   - Verify user permissions
   - Validate query syntax

3. **Authentication Issues**
   - Confirm correct keys used
   - Check user session
   - Verify role permissions

## Testing Edge Functions

### Local Testing Setup

1. **Environment Setup**

   ```bash
   # Create env file for tests
   touch supabase/functions/.env.local

   # Add required variables
   echo "SUPABASE_URL=http://localhost:54321" >> supabase/functions/.env.local
   echo "SUPABASE_ANON_KEY=your_local_key" >> supabase/functions/.env.local
   ```

2. **Test File Structure**

   ```typescript
   // deno-test.ts
   import 'https://deno.land/x/dotenv/load.ts';
   import {
     assert,
     assertExists,
     assertEquals,
   } from 'https://deno.land/std@0.192.0/testing/asserts.ts';
   import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

   // Client configuration
   const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
   const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
   const options = {
     auth: {
       autoRefreshToken: false,
       persistSession: false,
       detectSessionInUrl: false,
     },
   };

   // Example test
   const testFunction = async () => {
     const client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options);
     const { data, error } = await client.functions.invoke('function-name', {
       body: { param: 'value' },
     });

     if (error) throw new Error('Invalid response: ' + error.message);
     assertEquals(data.expectedField, 'expectedValue');
   };

   Deno.test('Function Test', testFunction);
   ```

3. **Running Tests**
   ```bash
   # Run tests with all permissions
   deno test --allow-all deno-test.ts
   ```

### Advanced Testing

1. **Mocking Requests**

   ```typescript
   // Mock request helper
   const createMockRequest = (options = {}) => {
     return new Request('http://localhost:54321', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         ...options.headers,
       },
       body: JSON.stringify(options.body || {}),
     });
   };

   // Test with mocked request
   Deno.test('Function Handler', async () => {
     const req = createMockRequest({
       body: { action: 'test' },
       headers: {
         Authorization: `Bearer ${supabaseKey}`,
       },
     });

     const res = await yourFunction(req);
     assertEquals(res.status, 200);

     const data = await res.json();
     assertEquals(data.success, true);
   });
   ```

2. **Testing Authentication**

   ```typescript
   Deno.test('Authorization Checks', async () => {
     // Test without auth header
     const noAuthReq = createMockRequest();
     const noAuthRes = await yourFunction(noAuthReq);
     assertEquals(noAuthRes.status, 401);

     // Test with invalid token
     const invalidAuthReq = createMockRequest({
       headers: {
         Authorization: 'Bearer invalid',
       },
     });
     const invalidAuthRes = await yourFunction(invalidAuthReq);
     assertEquals(invalidAuthRes.status, 401);

     // Test with valid token
     const validAuthReq = createMockRequest({
       headers: {
         Authorization: `Bearer ${supabaseKey}`,
       },
     });
     const validAuthRes = await yourFunction(validAuthReq);
     assertEquals(validAuthRes.status, 200);
   });
   ```

3. **CI/CD Integration**

   ```yaml
   # .github/workflows/test.yml
   name: Test Edge Functions

   on:
     push:
       paths:
         - 'supabase/functions/**'

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - name: Setup Deno
           uses: denoland/setup-deno@v1

         - name: Start Supabase
           uses: supabase/setup-cli@v1

         - name: Run Tests
           run: |
             supabase start
             deno test --allow-all supabase/functions/tests/
   ```

4. **Test Coverage**
   - Input Validation
   - Error Handling
   - Edge Cases
   - Security Checks
   - Performance Testing
   - Database Interactions
   - External API Calls
   - Rate Limiting
   - Timeout Scenarios

### Best Practices

1. **Test Structure**

   - Group related tests
   - Use descriptive names
   - Clean up test data
   - Test error cases
   - Implement security checks

2. **Common Test Cases**

   - Valid input parameters
   - Invalid/missing parameters
   - Authentication scenarios
   - Error conditions
   - Edge cases

3. **CORS Testing**

   ```typescript
   // Example CORS headers for testing
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   };

   // Test OPTIONS request
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
   ```

4. **Debugging Tips**
   - Use `console.log` for debugging (visible in test output)
   - Test functions in isolation
   - Verify environment variables before testing
   - Check CORS headers in responses

## Quick Reference Commands

```bash
# Supabase
supabase start     # Start local stack
supabase stop      # Stop local stack
supabase status    # Check service status

# Edge Functions
supabase functions serve                  # Serve locally
supabase functions deploy function-name   # Deploy
supabase functions list                   # List functions

# Database
supabase db reset    # Reset local database
supabase db pull     # Pull remote schema
supabase db push     # Push local schema

```

### Environment Variables

#### Default Supabase Secrets

```typescript
// Available in all Edge Functions by default
const supabaseUrl = Deno.env.get('SUPABASE_URL')          # API gateway
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') # Safe for browser
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') # Never expose!
const supabaseDbUrl = Deno.env.get('SUPABASE_DB_URL')     # Direct DB access
```

#### Local Development

- Create local env file:

  ```bash
  # Create development env file
  touch ./supabase/functions/.env.local

  # Add variables
  echo "OPENAI_API_KEY=your_key" >> ./supabase/functions/.env.local
  ```

- Load environment variables:

  ```bash
  # Method 1: Automatic loading with supabase start
  supabase start

  # Method 2: Specify env file explicitly
  supabase functions serve --env-file ./supabase/functions/.env.local
  ```

#### Production Setup

```bash
# Create production env file
cp ./supabase/functions/.env.local ./supabase/functions/.env

# Deploy all secrets at once
supabase secrets set --env-file ./supabase/functions/.env

# Or set individual secrets
supabase secrets set OPENAI_API_KEY=your_key

# List all remote secrets
supabase secrets list
```

#### Best Practices

- Never commit `.env` files to Git
- Use `.env.local` for development
- Use `.env` for production
- Keep service role key secure
- Add `.env*` to `.gitignore`
- Use descriptive variable names
- Document required variables

#### Access in Functions

```typescript
// Safe usage in Edge Functions
const apiKey = Deno.env.get('MY_API_KEY');
if (!apiKey) {
  throw new Error('Missing required API key');
}

// With type safety
const dbUrl = Deno.env.get('SUPABASE_DB_URL');
if (!dbUrl) {
  throw new Error('Database URL is required');
}
```

#### Environment-Specific Configuration

```typescript
const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
const config = {
  apiUrl: isProduction ? 'https://api.production.com' : 'http://localhost:3000',
  debug: !isProduction,
};
```

## Continuous Deployment

### GitHub Actions Setup

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Edge Functions

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/functions/**'
  workflow_dispatch: # Enable manual triggers

jobs:
  deploy:
    runs-on: ubuntu-latest

    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      PROJECT_ID: your-project-id

    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy Functions
        run: |
          supabase functions deploy --project-ref $PROJECT_ID
```

### Environment Setup

- Required Secrets:
  ```bash
  # GitHub Repository Settings > Secrets
  SUPABASE_ACCESS_TOKEN=your_access_token
  ```
- Project Configuration:
  ```yaml
  env:
    PROJECT_ID: your-project-id # From Supabase Dashboard
  ```

### Best Practices

- Use path filters to trigger only on function changes
- Include environment variable deployment
- Add version tagging
- Implement staging environments
- Add deployment notifications
- Include rollback procedures

### Enhanced Workflow Example

```yaml
name: Edge Function CI/CD

on:
  push:
    branches:
      - main
      - staging
    paths:
      - 'supabase/functions/**'
      - '.github/workflows/deploy-functions.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1

      - name: Run Tests
        run: |
          cd supabase/functions
          deno test --allow-env --allow-net

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

    steps:
      - uses: actions/checkout@v3

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy Functions
        run: |
          supabase functions deploy --project-ref ${{ secrets.PROJECT_ID }}

      - name: Notify Deployment
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"✅ Edge Functions deployed successfully!"}'
```

### Deployment Verification

```typescript
// health-check/index.ts
Deno.serve(async _req => {
  const version = process.env.GITHUB_SHA ?? 'unknown';
  const environment = process.env.ENVIRONMENT ?? 'unknown';

  return new Response(
    JSON.stringify({
      status: 'healthy',
      version,
      environment,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
```

### Security Considerations

- Rotate access tokens regularly
- Use environment-specific secrets
- Implement deployment approvals
- Scan dependencies for vulnerabilities
- Log all deployment activities
- Monitor function performance post-deployment

## Background Tasks

### Basic Implementation

```typescript
// Define custom event type
class BackgroundTaskEvent extends Event {
  readonly taskPromise: Promise<Response>;

  constructor(taskPromise: Promise<Response>) {
    super('backgroundTask');
    this.taskPromise = taskPromise;
  }
}

// Register event listener
globalThis.addEventListener('backgroundTask', async event => {
  const res = await (event as BackgroundTaskEvent).taskPromise;
  console.log(await res.json());
});

// Use in Edge Function
Deno.serve(async req => {
  // Start background task
  const taskPromise = fetch('https://api.example.com/data');
  const event = new BackgroundTaskEvent(taskPromise);
  globalThis.dispatchEvent(event);

  // Respond immediately
  return new Response('Processing started', { status: 202 });
});
```

### Local Development Setup

```toml
# supabase/config.toml
[edge_runtime]
policy = "per_worker"  # Prevents auto-termination of background tasks
```

```bash
# Start function with background task support
supabase functions serve

# Note: Hot-reload is disabled with per_worker policy
# Manual restart required after code changes
```

### Common Use Cases

```typescript
// File Upload Processing
Deno.serve(async req => {
  const file = await req.blob();

  // Start background processing
  const processPromise = (async () => {
    try {
      await uploadToStorage(file);
      await updateDatabase();
      await sendNotification();
    } catch (error) {
      console.error('Background task failed:', error);
    }
  })();

  const event = new BackgroundTaskEvent(processPromise);
  globalThis.dispatchEvent(event);

  return new Response('Upload queued', { status: 202 });
});
```

### Best Practices

- Return response quickly (202 Accepted)
- Handle errors in background tasks
- Log task progress and completion
- Consider task timeouts (wall-clock limits)
- Monitor CPU/Memory usage
- Implement retry mechanisms
- Use idempotency keys for safety

### Limitations

- Tasks limited by instance wall-clock time
- CPU/Memory limits apply
- No persistence between function invocations
- Local development requires special configuration
- Hot-reload disabled in per_worker mode

### Error Handling

```typescript
class TaskError extends Error {
  constructor(
    message: string,
    public readonly details: unknown
  ) {
    super(message);
  }
}

globalThis.addEventListener('backgroundTask', async event => {
  try {
    await (event as BackgroundTaskEvent).taskPromise;
  } catch (error) {
    console.error(new TaskError('Background task failed', error));
    // Implement error reporting/monitoring here
  }
});
```

### Monitoring and Logging

```typescript
class MonitoredTaskEvent extends BackgroundTaskEvent {
  constructor(taskPromise: Promise<Response>, taskId: string) {
    super(taskPromise);
    this.logProgress(taskId);
  }

  private async logProgress(taskId: string) {
    const startTime = Date.now();
    try {
      await this.taskPromise;
      console.log(`Task ${taskId} completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error(`Task ${taskId} failed after ${Date.now() - startTime}ms:`, error);
    }
  }
}
```

## Logging and Monitoring

1. **Logging Locations**

   - **Local Development**
     ```bash
     # Logs appear in terminal
     supabase functions serve
     ```
   - **Production**
     - Dashboard > Functions > Select Function
     - Two views:
       1. Invocations: Request/Response details
       2. Logs: Platform events and custom logs

2. **Logging Types**

   ```typescript
   Deno.serve(async req => {
     try {
       // Info logging
       console.log('Processing request...');

       // Warning for non-critical issues
       console.warn('Resource usage high');

       // Error logging
       console.error('Critical error:', error);

       // Debug information
       console.debug('Request details:', {
         method: req.method,
         path: new URL(req.url).pathname,
       });

       return new Response('OK');
     } catch (error) {
       console.error('Unhandled error:', error);
       return new Response('Error', { status: 500 });
     }
   });
   ```

3. **Request Header Logging**

   ```typescript
   Deno.serve(async req => {
     // Convert headers to loggable object
     const headersObject = Object.fromEntries(req.headers);
     console.log('Headers:', JSON.stringify(headersObject, null, 2));

     // Or log specific headers
     console.log('Auth:', req.headers.get('authorization'));
     console.log('Content-Type:', req.headers.get('content-type'));

     return new Response('OK');
   });
   ```

4. **Structured Logging**

   ```typescript
   interface LogEntry {
     level: 'info' | 'warn' | 'error';
     message: string;
     timestamp: string;
     metadata?: Record<string, unknown>;
   }

   function logEvent(entry: LogEntry) {
     const logString = JSON.stringify({
       ...entry,
       timestamp: new Date().toISOString(),
     });

     switch (entry.level) {
       case 'error':
         console.error(logString);
         break;
       case 'warn':
         console.warn(logString);
         break;
       default:
         console.log(logString);
     }
   }

   // Usage
   Deno.serve(async req => {
     logEvent({
       level: 'info',
       message: 'Processing request',
       metadata: {
         path: new URL(req.url).pathname,
         method: req.method,
       },
     });
   });
   ```

5. **Limitations and Best Practices**

   - Maximum 10,000 characters per log message
   - Rate limit: 100 events per 10 seconds
   - Log levels:
     - `error`: System errors and exceptions
     - `warn`: Non-critical issues
     - `info`: General operational events
     - `debug`: Detailed debugging information
   - Best Practices:
     - Use structured logging
     - Include request IDs for tracking
     - Log sensitive data appropriately
     - Implement log rotation
     - Use appropriate log levels

6. **Error Handling**

   ```typescript
   class ApplicationError extends Error {
     constructor(
       message: string,
       public readonly code: string,
       public readonly metadata?: Record<string, unknown>
     ) {
       super(message);
     }
   }

   Deno.serve(async req => {
     try {
       throw new ApplicationError('Invalid input', 'VALIDATION_ERROR', { field: 'email' });
     } catch (error) {
       if (error instanceof ApplicationError) {
         console.error(
           JSON.stringify({
             code: error.code,
             message: error.message,
             metadata: error.metadata,
             stack: error.stack,
           })
         );
       }
       return new Response('Error', { status: 500 });
     }
   });
   ```

## Project Structure

```
└── supabase
    ├── functions
    │   ├── function-one
    │   │   └── index.ts
    │   ├── function-two
    │   │   └── index.ts
    │   └── tests
    │       ├── function-one-test.ts
    │       └── function-two-test.ts
    └── config.toml
```

### Test Setup

1. **Environment Configuration**

   ```bash
   # Create test environment file
   touch supabase/functions/.env.test

   # Add required variables
   echo "SUPABASE_URL=http://localhost:54321" >> .env.test
   echo "SUPABASE_ANON_KEY=your_local_key" >> .env.test
   ```

2. **Basic Test Structure**

   ```typescript
   import { assert, assertEquals } from 'https://deno.land/std@0.192.0/testing/asserts.ts';
   import { createClient } from 'jsr:@supabase/supabase-js@2';
   import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

   const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
   const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

   Deno.test('Database Test', async () => {
     const client = createClient(supabaseUrl, supabaseKey);
     const { data, error } = await client.from('your_table').select('*').limit(1);

     assert(!error, 'Query should not error');
     assert(data, 'Data should be returned');
   });
   ```

### Running Tests

1. **Local Development**

   ```bash
   # Start Supabase
   supabase start

   # Run tests
   deno test --allow-all supabase/functions/tests/
   ```

2. **Best Practices**
   - Group related tests
   - Use descriptive names
   - Clean up test data
   - Test error cases
   - Implement security checks

```

```
