# Report Generation System Documentation

This document provides a comprehensive guide to LaunchLab's report generation system, including data generation, storage, and display. Follow these guidelines when making changes to ensure consistency across the system.

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Structure](#data-structure)
3. [Report Generation Process](#report-generation-process)
4. [Database Storage](#database-storage)
5. [Frontend Display](#frontend-display)
6. [Making Changes](#making-changes)

## System Overview

The report generation system consists of three main components:

1. Edge Function for report generation using OpenAI
2. Supabase database for storage
3. Next.js frontend for display

File Structure:

```
/supabase
  /functions
    /generate-report
      - index.ts         # Edge function for report generation
/app
  /idea
    /report
      /[id]
        - page.tsx      # Report display page
/types
  - supabase.ts        # Type definitions
```

## Data Structure

### Report Interface

```typescript
interface Report {
  id: string;
  url: string;
  summary: string;
  key_strengths: {
    summary: string;
    points: string[];
    potential_impact: string;
  };
  monetization: {
    primary_stream: {
      approach: string;
      rationale: string;
      pricing: string;
      benefits: string[];
    };
    alternative_approaches: Array<{
      model: string;
      implementation: string;
      best_for: string;
      pricing: string;
      pros: string[];
      cons: string[];
    }>;
    optimization_opportunities: string;
    early_stage_strategy: {
      initial_approach: string;
      key_metrics: string[];
      adjustment_triggers: string[];
    };
  };
  refinement_questions: Array<{
    question: string;
    context: string;
  }>;
  challenges: Array<{
    challenge: string;
    description: string;
  }>;
  mitigation_strategies: Array<{
    strategy: string;
    details: string;
  }>;
  recommendation: {
    recommendation: string;
    priority: string;
    timeline: string;
  };
  improvement_areas: Array<{
    area: string;
    details: string;
  }>;
}
```

## Report Generation Process

### 1. Edge Function Configuration

Location: `/supabase/functions/generate-report/index.ts`

Key Components:

1. OpenAI Configuration

```typescript
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});
```

2. Function Schema

- Must match the Report interface exactly
- Define all required fields in the function schema
- Use proper JSON Schema types and validation

3. Error Handling

```typescript
try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini-2024-07-18',
    messages: messages,
    functions: [functionSchema],
    function_call: { name: 'generate_report' },
  });

  // Handle potential errors
  if (!completion.choices[0]?.message?.function_call?.arguments) {
    throw new Error('No completion generated');
  }

  // Parse and validate response
  const reportData = JSON.parse(completion.choices[0].message.function_call.arguments);

  // Initialize empty arrays/objects for nullable fields
  reportData.refinement_questions = reportData.refinement_questions || [];
  reportData.challenges = reportData.challenges || [];
  // ... initialize other arrays
} catch (error) {
  // Log error and return appropriate response
  console.error('Error generating report:', error);
  throw error;
}
```

### 2. Database Storage

Location: Supabase Database

Table: `idea_reports`

Required Steps for Storage:

1. Generate unique report ID

```typescript
const reportId = crypto.randomUUID();
```

2. Create report URL

```typescript
const reportUrl = `https://launchlab.ai/idea/report/${reportId}`;
```

3. Insert report data

```typescript
const { data, error } = await supabase
  .from('idea_reports')
  .insert({
    id: reportId,
    url: reportUrl,
    ...reportData,
  })
  .select()
  .single();
```

## Frontend Display

Location: `/app/idea/report/[id]/page.tsx`

### 1. Data Fetching

```typescript
const { data: report, error: fetchError } = await supabase
  .from('idea_reports')
  .select('*')
  .eq('id', params.id)
  .single();
```

### 2. Component Structure

```tsx
<div className="max-w-7xl mx-auto p-6 space-y-12">
  {/* Back Button */}
  <Link href="/idea">...</Link>

  <div className="space-y-8">
    {/* Executive Summary */}
    <div>...</div>

    {/* Key Strengths */}
    <div>...</div>

    {/* Monetization Strategy */}
    <div>...</div>

    {/* Refinement Questions */}
    <div>...</div>

    {/* Challenges and Solutions */}
    <div>...</div>

    {/* Recommendation */}
    <div>...</div>

    {/* Areas for Improvement */}
    <div>...</div>
  </div>
</div>
```

## Making Changes

Follow these steps when updating the report system:

### 1. Update Data Structure

1. Modify the Report interface in TypeScript
2. Update the OpenAI function schema to match
3. Update database types and migrations if needed

### 2. Update Edge Function

1. Modify the prompt to generate new fields
2. Update error handling for new fields
3. Test the function with sample inputs
4. Verify the output matches the updated interface

### 3. Update Database

1. Create a new migration if schema changes are needed
2. Test data insertion with new fields
3. Verify data retrieval works correctly

### 4. Update Frontend

1. Modify the report page component
2. Add new sections for new fields
3. Style new components consistently
4. Test with various data scenarios

### 5. Testing Checklist

- [ ] Edge function generates all required fields
- [ ] Database successfully stores all data
- [ ] Frontend displays all fields correctly
- [ ] Error handling works for all scenarios
- [ ] UI is responsive and consistent
- [ ] Performance is acceptable

## Best Practices

1. **Data Validation**

   - Always validate OpenAI responses
   - Initialize empty arrays/objects for nullable fields
   - Use TypeScript types consistently

2. **Error Handling**

   - Log errors with context
   - Provide user-friendly error messages
   - Handle edge cases gracefully

3. **UI/UX**

   - Maintain consistent spacing and typography
   - Use loading states for async operations
   - Provide clear error messages
   - Ensure responsive design

4. **Performance**

   - Optimize database queries
   - Use appropriate caching strategies
   - Lazy load components when possible

5. **Security**
   - Validate user permissions
   - Sanitize user inputs
   - Protect sensitive data
   - Use environment variables for secrets

## Troubleshooting

Common issues and solutions:

1. **OpenAI Response Issues**

   - Check function schema matches interface exactly
   - Verify API key and rate limits
   - Check for model-specific limitations

2. **Database Issues**

   - Verify column types match data
   - Check for null constraints
   - Verify index performance

3. **Frontend Issues**
   - Check data fetching error handling
   - Verify component props and types
   - Test responsive breakpoints

## Support

For questions or issues:

1. Check this documentation first
2. Review relevant code comments
3. Contact the development team
4. Create an issue in the repository
