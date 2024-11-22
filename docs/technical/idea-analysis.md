# Idea Analysis System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Implementation Details](#implementation-details)
4. [Data Flow](#data-flow)
5. [Making Changes](#making-changes)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## System Overview

The idea analysis system processes user-submitted business ideas through OpenAI's GPT-4o-mini model to generate insights, reports, and recommendations.

### Components

- Idea submission form
- OpenAI integration
- Report generation
- Insights generation
- Data storage in Supabase

## Architecture

### Frontend Components

1. **Idea Page** (`/app/idea/page.tsx`)

   - Idea submission form
   - Initial analysis display

2. **Insights Page** (`/app/idea/insights/page.tsx`)

   - Detailed analysis visualization
   - Interactive components

3. **Report Page** (`/app/idea/report/[id]/page.tsx`)
   - Comprehensive report display
   - Structured recommendations

### Backend Components

1. **Edge Functions**

   - Report generation
   - OpenAI integration
   - Error handling

2. **Database Tables**
   - `idea_reports`
   - `idea_insights`
   - Related metadata tables

## Implementation Details

### Idea Submission

```typescript
// Example of idea submission structure
interface IdeaSubmission {
  title: string;
  description: string;
  target_audience: string;
  problem_solved: string;
  unique_value: string;
}
```

### Analysis Pipeline

1. User submits idea
2. Initial processing and validation
3. OpenAI analysis
4. Report and insights generation
5. Data storage
6. Results display

## Data Flow

### 1. Input Processing

- Validate user input
- Format data for OpenAI
- Prepare analysis context

### 2. OpenAI Integration

- Send formatted prompts
- Process responses
- Handle errors and retries

### 3. Data Storage

- Store raw responses
- Process and structure data
- Update related tables

### 4. Frontend Display

- Fetch processed data
- Render insights and reports
- Handle user interactions

## Making Changes

When updating the idea analysis system:

1. **Update Input Processing**

   - Modify validation rules
   - Update data formatting
   - Adjust error handling

2. **Update OpenAI Integration**

   - Modify prompts
   - Update response processing
   - Adjust model parameters

3. **Update Data Storage**

   - Modify database schema
   - Update data processing
   - Adjust query patterns

4. **Update Frontend**

   - Modify display components
   - Update user interactions
   - Adjust styling

5. **Testing Checklist**
   - [ ] Input validation works
   - [ ] OpenAI integration functions
   - [ ] Data is stored correctly
   - [ ] Frontend displays correctly
   - [ ] Error handling works

## Best Practices

1. **Data Processing**

   - Validate all user input
   - Handle edge cases
   - Implement proper error handling
   - Use TypeScript types

2. **OpenAI Integration**

   - Use structured outputs
   - Implement retry logic
   - Handle rate limits
   - Log important events

3. **Frontend Development**

   - Use loading states
   - Implement error boundaries
   - Follow accessibility guidelines
   - Maintain responsive design

4. **Performance**
   - Optimize database queries
   - Implement caching where appropriate
   - Monitor API usage
   - Track response times

## Troubleshooting

### Common Issues

1. **OpenAI Issues**

   - Rate limit exceeded
   - Invalid responses
   - Timeout errors
   - Model errors

2. **Database Issues**

   - Query performance
   - Data consistency
   - Schema conflicts

3. **Frontend Issues**
   - Loading states
   - Error displays
   - Data formatting

### Debug Steps

1. Check server logs
2. Verify OpenAI responses
3. Check database queries
4. Monitor frontend console
5. Verify environment variables
