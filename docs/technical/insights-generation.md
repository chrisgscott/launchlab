# Insights Generation Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Implementation Details](#implementation-details)
4. [Data Flow](#data-flow)
5. [Making Changes](#making-changes)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## System Overview

The insights generation system analyzes business ideas and presents structured insights through an interactive interface.

### Current Implementation Status

- [x] Basic insights page structure
- [x] Data fetching from Supabase
- [x] Initial visualization components
- [ ] Advanced analytics
- [ ] Comparative analysis
- [ ] Historical tracking

## Architecture

### Frontend Components

1. **Insights Page** (`/app/idea/insights/page.tsx`)

   - Main insights display
   - Interactive components
   - Data visualization

2. **Shared Components**
   - Loading states
   - Error boundaries
   - Data display components

### Backend Integration

1. **Data Sources**
   - Supabase tables
   - OpenAI analysis results
   - User metadata

## Implementation Details

### Data Structure

```typescript
interface InsightCategory {
  name: string;
  score: number;
  strengths: string[];
  opportunities: string[];
  questions: string[];
}

interface Insights {
  categories: InsightCategory[];
  overall_score: number;
  summary: string;
}
```

### Current Features

1. **Category Analysis**

   - Scores by category
   - Strengths and opportunities
   - Key questions

2. **Overall Assessment**
   - Aggregate scoring
   - Summary insights
   - Recommendations

TODO: Document advanced analytics features once implemented

## Data Flow

### 1. Data Fetching

```typescript
const fetchInsights = async (ideaId: string) => {
  const { data, error } = await supabase
    .from('idea_insights')
    .select('*')
    .eq('idea_id', ideaId)
    .single();

  if (error) throw error;
  return data;
};
```

### 2. Data Processing

- Parse raw data
- Calculate derived metrics
- Format for display

### 3. Visualization

- Render charts and graphs
- Display structured data
- Handle user interactions

## Making Changes

When updating the insights system:

1. **Update Data Structure**

   - Modify TypeScript interfaces
   - Update database schema
   - Adjust data processing

2. **Update Components**

   - Modify visualization components
   - Update interaction handlers
   - Adjust styling

3. **Testing Checklist**
   - [ ] Data fetching works
   - [ ] Processing is correct
   - [ ] Visualizations render properly
   - [ ] Interactions work as expected

## Best Practices

1. **Data Processing**

   - Validate all data
   - Handle edge cases
   - Use TypeScript types
   - Document calculations

2. **Visualization**

   - Use accessible colors
   - Provide clear labels
   - Include loading states
   - Handle errors gracefully

3. **Performance**

   - Optimize data queries
   - Use appropriate caching
   - Lazy load components
   - Monitor render performance

4. **Code Organization**
   - Separate concerns
   - Use consistent patterns
   - Document complex logic
   - Write maintainable code

## Troubleshooting

### Common Issues

1. **Data Issues**

   - Missing or null values
   - Incorrect calculations
   - Type mismatches

2. **Visualization Issues**

   - Rendering problems
   - Layout issues
   - Performance problems

3. **Interaction Issues**
   - Event handling
   - State updates
   - Loading states

### Debug Steps

1. Check data structure
2. Verify calculations
3. Test component rendering
4. Monitor performance
5. Check error boundaries

## Future Improvements

TODO: Document planned features:

- Advanced analytics dashboard
- Comparative analysis tools
- Historical trend tracking
- Custom insight generation
- Export functionality
