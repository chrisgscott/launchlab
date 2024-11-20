# Security Guide

This guide covers security best practices and configurations for LaunchLab.

## Table of Contents

1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Data Security](#data-security)
4. [API Security](#api-security)
5. [Infrastructure Security](#infrastructure-security)

## Authentication

### Supabase Auth Setup

```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}
```

### Protected Routes

```typescript
// middleware/auth.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && req.nextUrl.pathname.startsWith('/protected')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
```

## Authorization

### Row Level Security (RLS)

```sql
-- Enable RLS
alter table "public"."users" enable row level security;

-- Users can read their own data
create policy "Users can read own data"
  on users for select
  using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own data"
  on users for update
  using (auth.uid() = id);

-- Admin can read all data
create policy "Admins can read all data"
  on users for select
  using (
    exists (
      select 1
      from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
```

### Role-Based Access Control

```typescript
// lib/rbac.ts
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: string;
}

export const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    { action: 'read', resource: 'posts' },
    { action: 'create', resource: 'comments' },
  ],
  [Role.ADMIN]: [
    { action: 'create', resource: 'posts' },
    { action: 'update', resource: 'posts' },
    { action: 'delete', resource: 'comments' },
  ],
  [Role.SUPER_ADMIN]: [
    { action: 'create', resource: '*' },
    { action: 'read', resource: '*' },
    { action: 'update', resource: '*' },
    { action: 'delete', resource: '*' },
  ],
};

export function hasPermission(
  userRole: Role,
  action: Permission['action'],
  resource: string
): boolean {
  const permissions = rolePermissions[userRole];
  return permissions.some(
    p =>
      (p.action === action || p.action === '*') && (p.resource === resource || p.resource === '*')
  );
}
```

## Data Security

### Encryption

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class Encryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(key: string) {
    this.key = Buffer.from(key, 'hex');
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### Data Sanitization

```typescript
// lib/sanitization.ts
import { sanitizeHtml } from 'sanitize-html';

export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      a: ['href'],
    },
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeObject<T extends object>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
```

## API Security

### Rate Limiting

```typescript
// lib/rate-limit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'auth-limit:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again later.',
});
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
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
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Infrastructure Security

### Environment Variables

```typescript
// lib/env.ts
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ENCRYPTION_KEY',
  ];

  for (const name of required) {
    if (!process.env[name]) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
}

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}
```

### Secure Configuration

```typescript
// config/security.ts
export const securityConfig = {
  passwords: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  sessions: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
};

export function validatePassword(password: string): boolean {
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } =
    securityConfig.passwords;

  if (password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumbers && !/[0-9]/.test(password)) return false;
  if (requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) return false;

  return true;
}
```

### Best Practices

1. Authentication

   - Use secure password hashing
   - Implement MFA where possible
   - Secure session management
   - Regular session cleanup

2. Authorization

   - Implement proper RBAC
   - Use RLS for database security
   - Regular permission audits
   - Principle of least privilege

3. Data Security

   - Encrypt sensitive data
   - Sanitize all inputs
   - Regular security audits
   - Secure data backups

4. API Security

   - Rate limiting
   - Input validation
   - Security headers
   - API authentication

5. Infrastructure
   - Regular updates
   - Security monitoring
   - Access control
   - Audit logging
