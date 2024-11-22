# LaunchLab Development Guide

> For detailed technical documentation, please refer to our [main documentation index](./index.md).

## Quick Start

1. Set up your environment by following the [Environment Setup Guide](./environment-setup.md)
2. Follow the [Local Development Guide](./local-development.md) to get the project running
3. Review the [Testing Guide](./testing.md) before making changes

## Current State

Last Updated: 2024-01-25

### Current Development Focus

- **Business Blueprint Generation**

  - Status: Active Development
  - Priority: High
  - Dependencies: OpenAI API, Brevo API, Supabase
  - Components:
    - Asynchronous report generation via Edge Functions
    - Structured insights data with category-specific analysis
    - Secure report storage and access control
    - Email delivery system with Brevo integration
  - Recent Updates:
    - Standardized OpenAI model to gpt-4o-mini-2024-07-18
    - Improved error handling and API key management
    - Enhanced structured data validation
    - Added comprehensive technical documentation

- **Documentation System**

  - Status: Active
  - Priority: High
  - Dependencies: None
  - Recent Updates:
    - Added new technical documentation:
      - API Integration Guide
      - Authentication Guide
      - Frontend Architecture Guide
      - Idea Analysis Guide
      - Insights Generation Guide
      - Report Generation Guide
      - Structured Outputs Guide
    - Updated all OpenAI model references
    - Improved development workflow documentation

- **Landing Page Builder**

  - Status: In Planning
  - Priority: High
  - Dependencies: None
  - Notes: Will need to integrate with existing UI components and design system

### Active Features

- Business Blueprint Generation
- Insights Dashboard
- Idea Analysis Flow

### Recent Changes

- AI System Updates:

  - Standardized OpenAI model to gpt-4o-mini-2024-07-18 across all components
  - Enhanced error handling for API calls
  - Improved environment variable management
  - Updated prompts and structured outputs

- Backend improvements:

  - Consolidated database migrations
  - Enhanced type safety for API responses
  - Improved error handling in Edge Functions
  - Updated Supabase client configuration

- Documentation enhancements:

  - Added comprehensive technical guides
  - Updated API integration documentation
  - Enhanced development workflow guides
  - Improved structured outputs documentation

- Frontend enhancements:

  - Added type-safe insights rendering with category-specific components
  - Improved loading states and error handling
  - Enhanced UI for report generation progress
  - Updated email capture flow with proper validation

- Infrastructure updates:
  - Added new database migrations for report system
  - Updated seed data for testing
  - Fixed husky and lint-staged configuration
  - Improved development workflow

### Architecture Overview

- **Frontend**: Next.js 14 with App Router
- **Styling**: TailwindCSS + DaisyUI
- **Backend**: Supabase
- **AI**: OpenAI integration using gpt-4o-mini-2024-07-18 model (optimized for performance and cost)
- **Email**: Brevo

For detailed technical information about each component, please refer to:

- [Database Guide](./database.md) for Supabase setup and usage
- [Edge Functions Guide](./edge-functions.md) for serverless functions
- [Security Guide](./security.md) for authentication and data protection
- [Monitoring Guide](./monitoring.md) for observability and logging
- [Background Tasks Guide](./background-tasks.md) for async operations
- [Deployment Guide](./deployment.md) for CI/CD and production setup

### Key Components

- `IdeaInput.tsx`: Main form component with educational content
- `EmailCaptureModal.tsx`: Handles report email capture
- `insights/page.tsx`: Displays analysis results with category-specific rendering
- `generate-report/index.ts`: Edge Function for async report generation
- `idea_reports`: New database table for storing generated reports

### Active Branches

- `stable-insights`: Current working branch (created from f382c8a)

### Environment Variables

See the [Environment Setup Guide](./environment-setup.md) for a complete list of required variables.

### AI Configuration

- **Model**: gpt-4o-mini-2024-07-18
- **Key Features**:
  - High performance
  - Cost-effective
  - DO NOT change or upgrade this model

### Known Issues

- None currently

### Next Steps

- Set up User Account System
- Implement Landing Page Builder
