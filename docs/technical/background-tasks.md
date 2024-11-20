# Background Tasks Guide

This guide covers implementing and managing background tasks in LaunchLab.

## Table of Contents

1. [Overview](#overview)
2. [Implementation](#implementation)
3. [Error Handling](#error-handling)
4. [Monitoring](#monitoring)
5. [Best Practices](#best-practices)

## Overview

Background tasks in Edge Functions are implemented using async operations that continue after the initial response is sent to the client.

### Use Cases

1. Processing large datasets
2. Sending emails
3. Image processing
4. Data synchronization
5. Cleanup operations

### Limitations

1. Maximum execution time
2. Memory constraints
3. Cold start implications
4. Network timeouts
5. State management

## Implementation

### Basic Background Task

```typescript
// supabase/functions/process-data/index.ts
Deno.serve(async req => {
  const { data } = await req.json();

  // Start background processing
  const processPromise = (async () => {
    try {
      await processData(data);
    } catch (error) {
      console.error('Background task failed:', error);
    }
  })();

  // Return immediate response
  return new Response(JSON.stringify({ message: 'Processing started' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Task Queue Implementation

```typescript
// supabase/functions/_shared/queue.ts
export class TaskQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  async add(task: () => Promise<void>) {
    this.queue.push(task);
    if (!this.processing) {
      await this.process();
    }
  }

  private async process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      try {
        await task();
      } catch (error) {
        console.error('Task failed:', error);
      }
    }
    this.processing = false;
  }
}

export const taskQueue = new TaskQueue();
```

### Task Status Tracking

```typescript
// supabase/functions/_shared/taskStatus.ts
export interface TaskStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  result?: any;
}

export class TaskManager {
  private tasks = new Map<string, TaskStatus>();

  createTask(id: string): TaskStatus {
    const task: TaskStatus = {
      id,
      status: 'pending',
    };
    this.tasks.set(id, task);
    return task;
  }

  updateTask(id: string, update: Partial<TaskStatus>) {
    const task = this.tasks.get(id);
    if (task) {
      Object.assign(task, update);
    }
  }

  getTask(id: string): TaskStatus | undefined {
    return this.tasks.get(id);
  }
}

export const taskManager = new TaskManager();
```

## Error Handling

### Retry Logic

```typescript
// supabase/functions/_shared/retry.ts
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}
```

### Error Reporting

```typescript
// supabase/functions/_shared/errorReporting.ts
export interface ErrorReport {
  taskId: string;
  error: string;
  context: Record<string, any>;
  timestamp: string;
}

export class ErrorReporter {
  async report(error: Error, context: Record<string, any> = {}) {
    const report: ErrorReport = {
      taskId: context.taskId ?? 'unknown',
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
    };

    // Log to database or external service
    await supabase.from('error_logs').insert(report);
  }
}

export const errorReporter = new ErrorReporter();
```

## Monitoring

### Task Metrics

```typescript
// supabase/functions/_shared/metrics.ts
export class TaskMetrics {
  private metrics = new Map<string, number>();

  increment(metric: string, value = 1) {
    const current = this.metrics.get(metric) ?? 0;
    this.metrics.set(metric, current + value);
  }

  async report() {
    const timestamp = new Date().toISOString();
    const metrics = Object.fromEntries(this.metrics);

    await supabase.from('task_metrics').insert({
      timestamp,
      metrics,
    });

    this.metrics.clear();
  }
}

export const taskMetrics = new TaskMetrics();
```

### Progress Tracking

```typescript
// supabase/functions/_shared/progress.ts
export class ProgressTracker {
  constructor(
    private taskId: string,
    private total: number
  ) {}

  private current = 0;

  update(completed: number) {
    this.current += completed;
    const progress = Math.min((this.current / this.total) * 100, 100);

    taskManager.updateTask(this.taskId, {
      progress,
      status: progress === 100 ? 'completed' : 'processing',
    });
  }
}
```

## Best Practices

### 1. Task Organization

```typescript
// Example of well-organized task
export class DataProcessingTask {
  constructor(
    private taskId: string,
    private data: any
  ) {}

  async execute() {
    const progress = new ProgressTracker(this.taskId, 100);

    try {
      // Process in chunks
      for (const chunk of this.data.chunks) {
        await this.processChunk(chunk);
        progress.update(chunk.length);
      }

      taskMetrics.increment('tasks_completed');
    } catch (error) {
      await errorReporter.report(error as Error, {
        taskId: this.taskId,
        data: this.data,
      });
      throw error;
    }
  }
}
```

### 2. Resource Management

```typescript
// Example of resource-aware task
export class ResourceAwareTask {
  private static activeTasks = 0;
  private static MAX_CONCURRENT = 5;

  static async execute(task: () => Promise<void>) {
    while (this.activeTasks >= this.MAX_CONCURRENT) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeTasks++;
    try {
      await task();
    } finally {
      this.activeTasks--;
    }
  }
}
```

### 3. Cleanup Strategies

```typescript
// Example of task cleanup
export class TaskCleanup {
  static async cleanupOldTasks() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    await supabase.from('task_status').delete().lt('created_at', cutoff.toISOString());
  }
}
```

### Best Practices Summary

1. Implement proper error handling
2. Use retry logic for transient failures
3. Monitor resource usage
4. Implement task status tracking
5. Use queues for task management
6. Implement proper logging
7. Regular cleanup of old tasks
8. Monitor performance metrics
