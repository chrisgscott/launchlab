# Environment Setup Guide

This guide covers environment configuration across different deployments for LaunchLab.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Local Development](#local-development)
3. [Production Setup](#production-setup)
4. [CI/CD Environment](#cicd-environment)
5. [Security Best Practices](#security-best-practices)

## Environment Variables

### Default Supabase Secrets

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Application Secrets

```env
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:54322/postgres
```

### Environment-Specific Variables

```env
# Development
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Local Development

### Setup Steps

1. Copy environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Configure local variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   ```

3. Configure development database:
   ```env
   DATABASE_URL=postgres://postgres:postgres@localhost:54322/postgres
   ```

### Environment File Structure

```
project-root/
├── .env.example          # Template with required variables
├── .env.local           # Local development variables
├── .env.test            # Test environment variables
└── supabase/
    └── functions/
        └── .env         # Edge Functions specific variables
```

## Production Setup

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
DATABASE_URL=your-production-database-url

# API Keys
OPENAI_API_KEY=your-production-key
```

### Deployment Platform Configuration

1. Vercel

   - Configure variables in project settings
   - Use environment variable groups
   - Enable preview environments

2. Supabase
   - Configure secrets in dashboard
   - Set up Edge Function variables
   - Configure database connection strings

## CI/CD Environment

### GitHub Actions

```yaml
name: CI/CD Pipeline

env:
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

jobs:
  test:
    environment: test
    env:
      NODE_ENV: test
      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

### Preview Environments

```yaml
preview:
  environment: preview
  env:
    NEXT_PUBLIC_SITE_URL: ${{ github.event.deployment.preview_url }}
    DATABASE_URL: ${{ secrets.PREVIEW_DATABASE_URL }}
```

## Security Best Practices

### Environment Variable Management

1. Never commit `.env` files to version control
2. Use different values for different environments
3. Rotate secrets regularly
4. Use secret management services in production

### Access Control

1. Limit access to production secrets
2. Use read-only keys where possible
3. Implement proper role-based access
4. Audit access regularly

### Encryption and Security

1. Encrypt sensitive environment variables
2. Use SSL/TLS for all connections
3. Implement proper key rotation
4. Monitor for exposed secrets

### Best Practices

1. Use descriptive variable names
2. Document all required variables
3. Validate environment variables at startup
4. Keep sensitive information server-side

### Environment Validation

```typescript
// config/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
] as const;

export function validateEnv() {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
```

### Type Safety

```typescript
// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
```
