# Database Guide

This guide covers database setup, access patterns, and best practices for working with the LaunchLab database.

## Table of Contents

1. [Connection Setup](#connection-setup)
2. [Access Patterns](#access-patterns)
3. [Security and Permissions](#security-and-permissions)
4. [Schema Management](#schema-management)
5. [Performance Optimization](#performance-optimization)

## Connection Setup

### Client-Side

```typescript
import { createClient } from '@/libs/supabase/client';
const supabase = createClient();
```

### Server-Side (Edge Functions)

```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
```

### API Routes

```typescript
import { createClient } from '@/libs/supabase/server';
const supabase = createClient();
```

## Access Patterns

### Using Supabase Client

```typescript
// Fetching data
const { data, error } = await supabase.from('table_name').select('*').eq('column', 'value');

// Inserting data
const { data, error } = await supabase.from('table_name').insert({ column: 'value' }).select();

// Updating data
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', 1)
  .select();
```

### Using Drizzle ORM

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Fetching data
const result = await db.select().from(tableName).where(eq(tableName.column, value));

// Inserting data
const result = await db.insert(tableName).values({ column: value }).returning();
```

## Security and Permissions

### Row Level Security (RLS)

```sql
-- Enable RLS
alter table table_name enable row level security;

-- Create policy for authenticated users
create policy "Users can view own data"
  on table_name
  for select
  using (auth.uid() = user_id);

-- Create policy for specific roles
create policy "Admins can do everything"
  on table_name
  for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
```

### Best Practices

1. Always enable RLS on tables with sensitive data
2. Use the least privileged role necessary
3. Never expose service role keys in client-side code
4. Validate all input data before insertion
5. Use prepared statements to prevent SQL injection

## Schema Management

### Migration Files

```sql
-- 001_initial_schema.sql
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for frequently queried columns
create index users_email_idx on users (email);
```

### Schema Changes

```bash
# Create a new migration
supabase migration new my_migration_name

# Apply migrations
supabase db reset    # Reset local database
supabase db pull     # Pull remote schema
supabase db push     # Push local schema
```

## Performance Optimization

### Indexing Strategy

1. Index foreign key columns
2. Index frequently queried columns
3. Use composite indexes for multi-column queries
4. Monitor and maintain indexes

### Query Optimization

```typescript
// Use specific column selection
const { data } = await supabase.from('table').select('id, name, email'); // Better than select('*')

// Use pagination
const { data } = await supabase.from('table').select('*').range(0, 9); // First 10 records

// Use efficient joins
const { data } = await supabase.from('table1').select(`
    id,
    name,
    table2 (id, related_data)
  `);
```

### Monitoring

1. Use Supabase Dashboard for query analytics
2. Monitor slow queries
3. Set up alerts for database metrics
4. Regular performance audits

## Common Issues and Solutions

### Connection Issues

1. Check environment variables
2. Verify network connectivity
3. Check SSL configuration
4. Verify connection pool settings

### Performance Issues

1. Review and optimize queries
2. Check index usage
3. Monitor connection pool
4. Review database load

### Security Issues

1. Audit RLS policies
2. Review role permissions
3. Check for exposed credentials
4. Monitor failed authentication attempts
