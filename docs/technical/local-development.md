# Local Development Guide

This guide covers everything you need to know about setting up and running LaunchLab locally.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running the Project](#running-the-project)
4. [Development Workflow](#development-workflow)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. Node.js (v18 or later)
2. pnpm (v8 or later)
3. Docker Desktop
4. Supabase CLI
5. Deno (for Edge Functions)
6. Git

### Installation Commands

```bash
# Install Node.js using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Install Supabase CLI
brew install supabase/tap/supabase

# Install Deno
curl -fsSL https://deno.land/x/install/install.sh | sh
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/launchlab.git
cd launchlab
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
DATABASE_URL=postgres://postgres:postgres@localhost:54322/postgres
```

### 4. Start Supabase Services

```bash
supabase start
```

This will start:

- PostgreSQL database
- GoTrue (Auth)
- PostgREST
- Realtime
- Storage
- Edge Functions

## Running the Project

### Development Server

```bash
# Start the Next.js development server
pnpm dev

# In a separate terminal, serve Edge Functions
pnpm supabase:dev
```

### Available Scripts

```bash
# Run tests
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build
```

## Development Workflow

### 1. Database Changes

```bash
# Create a new migration
supabase migration new my_migration_name

# Apply migrations
supabase db reset

# Generate types
pnpm db:types
```

### 2. Edge Functions

```bash
# Create a new function
supabase functions new my-function-name

# Deploy function locally
supabase functions deploy my-function-name --no-verify-jwt

# Test function
curl -i --location --request POST 'http://localhost:54321/functions/v1/my-function-name' \
  --header 'Authorization: Bearer your-anon-key' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Test"}'
```

### 3. Working with Types

```typescript
// Generate database types
pnpm db:types

// Generate API types
pnpm api:types

// Update all types
pnpm types:sync
```

### 4. Git Workflow

```bash
# Create a new feature branch
git checkout -b feature/my-feature

# Make your changes and commit
git add .
git commit -m "feat: add new feature"

# Push changes
git push origin feature/my-feature
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Reset Supabase stack
supabase stop
supabase start

# Check database status
supabase status

# Reset database
supabase db reset
```

#### 2. Edge Function Issues

```bash
# Check function logs
supabase functions logs

# Restart function server
supabase functions serve --no-verify-jwt

# Clear function cache
rm -rf ~/.supabase/cache
```

#### 3. Next.js Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Debug Tools

#### 1. Database Explorer

Access at: http://localhost:54323

#### 2. API Documentation

Access at: http://localhost:54321/rest/v1/

#### 3. Auth Management

Access at: http://localhost:54321/auth/v1/

### Performance Optimization

#### 1. Development Server

```bash
# Clear all caches
pnpm clean

# Start with turbo cache
pnpm dev --turbo
```

#### 2. Database Queries

- Use the Supabase Dashboard to monitor query performance
- Enable slow query logging
- Use appropriate indexes

#### 3. Edge Functions

- Use cold starts sparingly
- Implement proper caching
- Monitor function execution time

### Best Practices

1. Code Organization

   - Follow the established project structure
   - Use feature-based organization
   - Keep components small and focused

2. Testing

   - Write tests for new features
   - Run tests before committing
   - Use appropriate testing utilities

3. Documentation

   - Document new features
   - Update existing documentation
   - Include code examples

4. Performance
   - Monitor bundle sizes
   - Optimize images and assets
   - Use appropriate caching strategies
