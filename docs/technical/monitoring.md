# Monitoring Guide

This guide covers logging, monitoring, and observability practices for LaunchLab.

## Table of Contents

1. [Logging Strategy](#logging-strategy)
2. [Monitoring Setup](#monitoring-setup)
3. [Metrics Collection](#metrics-collection)
4. [Alerting](#alerting)
5. [Debugging](#debugging)

## Logging Strategy

### Structured Logging

```typescript
// lib/logger.ts
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

export class Logger {
  private context: Record<string, any>;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }

  private log(level: LogEntry['level'], message: string, extra: Record<string, any> = {}) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...extra },
    };

    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      console.log(JSON.stringify(entry));
    } else {
      // Pretty print in development
      console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.context);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, {
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }
}
```

### Usage Examples

```typescript
// Example usage in API route
const logger = new Logger({ service: 'api', route: '/users' });

export default async function handler(req, res) {
  try {
    logger.info('Processing request', {
      method: req.method,
      query: req.query,
    });

    // Process request

    logger.info('Request completed successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Request failed', error, {
      statusCode: 500,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Monitoring Setup

### Performance Monitoring

```typescript
// lib/monitoring.ts
export interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  responseTime: number[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    errorCount: 0,
    responseTime: [],
  };

  recordRequest(duration: number, error?: Error) {
    this.metrics.requestCount++;
    this.metrics.responseTime.push(duration);
    if (error) {
      this.metrics.errorCount++;
    }
  }

  getMetrics() {
    const avgResponseTime =
      this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length;

    return {
      requestCount: this.metrics.requestCount,
      errorCount: this.metrics.errorCount,
      errorRate: this.metrics.errorCount / this.metrics.requestCount,
      avgResponseTime,
    };
  }
}
```

### Resource Monitoring

```typescript
// lib/resources.ts
export class ResourceMonitor {
  async getMetrics() {
    const usage = process.memoryUsage();

    return {
      memory: {
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        rss: usage.rss,
      },
      cpu: process.cpuUsage(),
    };
  }

  async monitor(interval = 60000) {
    setInterval(async () => {
      const metrics = await this.getMetrics();

      // Send metrics to monitoring service
      await this.reportMetrics(metrics);
    }, interval);
  }
}
```

## Metrics Collection

### Custom Metrics

```typescript
// lib/metrics.ts
export class MetricsCollector {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  incrementCounter(name: string, value = 1) {
    const current = this.counters.get(name) ?? 0;
    this.counters.set(name, current + value);
  }

  setGauge(name: string, value: number) {
    this.gauges.set(name, value);
  }

  recordHistogram(name: string, value: number) {
    const current = this.histograms.get(name) ?? [];
    current.push(value);
    this.histograms.set(name, current);
  }

  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms),
    };
  }
}
```

### Database Metrics

```typescript
// lib/db-metrics.ts
export class DatabaseMetrics {
  private queryTimes = new Map<string, number[]>();

  recordQuery(query: string, duration: number) {
    const times = this.queryTimes.get(query) ?? [];
    times.push(duration);
    this.queryTimes.set(query, times);
  }

  getSlowQueries(threshold = 1000) {
    const slowQueries = new Map<string, number>();

    for (const [query, times] of this.queryTimes) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime > threshold) {
        slowQueries.set(query, avgTime);
      }
    }

    return slowQueries;
  }
}
```

## Alerting

### Alert Configuration

```typescript
// lib/alerts.ts
export interface AlertRule {
  name: string;
  condition: (metrics: any) => boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export class AlertManager {
  private rules: AlertRule[] = [];
  private handlers: ((alert: Alert) => Promise<void>)[] = [];

  addRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  addHandler(handler: (alert: Alert) => Promise<void>) {
    this.handlers.push(handler);
  }

  async check(metrics: any) {
    for (const rule of this.rules) {
      if (rule.condition(metrics)) {
        const alert: Alert = {
          name: rule.name,
          message: rule.message,
          severity: rule.severity,
          timestamp: new Date().toISOString(),
          metrics,
        };

        await Promise.all(this.handlers.map(h => h(alert)));
      }
    }
  }
}
```

### Alert Handlers

```typescript
// lib/alert-handlers.ts
export class SlackAlertHandler {
  constructor(private webhookUrl: string) {}

  async handle(alert: Alert) {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${alert.severity.toUpperCase()}] ${alert.name}: ${alert.message}`,
        attachments: [
          {
            fields: Object.entries(alert.metrics).map(([k, v]) => ({
              title: k,
              value: String(v),
              short: true,
            })),
          },
        ],
      }),
    });
  }
}
```

## Debugging

### Debug Tools

```typescript
// lib/debug.ts
export class Debugger {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.DEBUG === 'true';
  }

  log(message: string, data?: any) {
    if (this.enabled) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  async captureState() {
    if (!this.enabled) return;

    const state = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      env: process.env,
      time: new Date().toISOString(),
    };

    await this.saveState(state);
  }
}
```

### Request Debugging

```typescript
// middleware/debug.ts
export function debugMiddleware(req, res, next) {
  if (process.env.DEBUG === 'true') {
    const requestId = Math.random().toString(36).substring(7);

    console.log(`[${requestId}] Request:`, {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    });

    const start = Date.now();

    res.on('finish', () => {
      console.log(`[${requestId}] Response:`, {
        statusCode: res.statusCode,
        duration: Date.now() - start,
      });
    });
  }

  next();
}
```

### Best Practices

1. Use structured logging
2. Implement proper error tracking
3. Monitor system resources
4. Set up alerting thresholds
5. Regular metric collection
6. Proper error handling
7. Debug mode configuration
8. Performance monitoring
