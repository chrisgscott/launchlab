# Deployment Guide

This guide covers deployment processes and CI/CD pipelines for LaunchLab.

## Table of Contents

1. [Deployment Strategy](#deployment-strategy)
2. [Environment Setup](#environment-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Monitoring](#monitoring)
5. [Rollback Procedures](#rollback-procedures)

## Deployment Strategy

### Overview

- Frontend: Vercel (Next.js)
- Backend: Supabase (Edge Functions, Database)
- CI/CD: GitHub Actions
- Monitoring: Supabase Dashboard

### Environments

1. Development (Local)
2. Staging
3. Production

## Environment Setup

### Production Environment

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# API Keys
OPENAI_API_KEY=your-production-key
```

### Staging Environment

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

# Application
NODE_ENV=staging
NEXT_PUBLIC_SITE_URL=https://staging.your-domain.com
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

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

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Deploy Edge Functions
        run: supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Migrations

```yaml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Run Migrations
        run: |
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

## Monitoring

### Health Checks

```typescript
// pages/api/health.ts
export default async function handler(req, res) {
  try {
    // Check database connection
    const { data, error } = await supabase.from('health_checks').select('id').limit(1);

    if (error) throw error;

    // Check Edge Functions
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/health`, {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!response.ok) throw new Error('Edge Function health check failed');

    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
}
```

### Performance Monitoring

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestStart = Date.now();

  const response = NextResponse.next();

  response.headers.set('Server-Timing', `total;dur=${Date.now() - requestStart}`);

  return response;
}
```

## Rollback Procedures

### Frontend Rollback

```bash
# Using Vercel CLI
vercel rollback --prod

# Using GitHub
git revert HEAD
git push origin main
```

### Database Rollback

```bash
# Revert last migration
supabase db reset --db-only

# Roll back to specific version
supabase db reset --version=12345
```

### Edge Functions Rollback

```bash
# List deployments
supabase functions list-deployments

# Rollback to previous version
supabase functions rollback function-name
```

## Best Practices

### 1. Deployment Checklist

- Run all tests
- Check database migrations
- Verify environment variables
- Test in staging environment
- Monitor deployment
- Verify functionality
- Check performance metrics

### 2. Security Measures

```typescript
// Verify security headers
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];
```

### 3. Performance Optimization

```typescript
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  images: {
    domains: ['your-domain.com'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### 4. Monitoring Setup

```typescript
// monitoring/setup.ts
export const monitoringConfig = {
  metrics: {
    endpoint: '/api/metrics',
    interval: 60000,
    labels: {
      app: 'launchlab',
      environment: process.env.NODE_ENV,
    },
  },
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: 'json',
  },
  alerts: {
    endpoints: [process.env.SLACK_WEBHOOK_URL, process.env.EMAIL_WEBHOOK_URL],
    thresholds: {
      errorRate: 0.01,
      responseTime: 1000,
    },
  },
};
```

### Deployment Best Practices

1. Use semantic versioning
2. Implement blue-green deployments
3. Automate deployment process
4. Monitor deployment metrics
5. Implement proper logging
6. Have rollback procedures
7. Regular security audits
8. Performance monitoring
