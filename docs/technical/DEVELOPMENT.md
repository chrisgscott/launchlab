# LaunchLab Development Guide

> For detailed technical documentation, please refer to our [main documentation index](./index.md).

## Quick Start

1. Set up your environment by following the [Environment Setup Guide](./environment-setup.md)
2. Follow the [Local Development Guide](./local-development.md) to get the project running
3. Review the [Testing Guide](./testing.md) before making changes

## Current State

Last Updated: 2024-11-20

### Current Development Focus

- **Business Blueprint Generation**

  - Status: Active Development
  - Priority: High
  - Dependencies: OpenAI API, Brevo API, Supabase
  - Components:
    - Generating detailed business blueprint/report
    - Saving reports to database
    - Creating unique, secure access links
    - Frontend report display
    - Email list signup via Brevo
    - Email delivery system
  - Recent Updates:
    - Implemented secure URL generation for report access
    - Added input validation for Edge Functions
    - Updated database schema for insights structure

- **Landing Page Builder**

  - Status: In Planning
  - Priority: High
  - Dependencies: None
  - Notes: Will need to integrate with existing UI components and design system

- **Documentation System**
  - Status: Active
  - Priority: High
  - Dependencies: None
  - Recent Updates:
    - Added automated DEVELOPMENT.md update workflow
    - Reorganized documentation structure
    - Implemented git hooks for maintaining documentation

### Active Features

- Business Blueprint Generation
- Insights Dashboard
- Idea Analysis Flow

### Recent Changes

- Reorganized documentation structure
- Updated product roadmap
- Created documentation update workflow and scripts

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
- `insights/page.tsx`: Displays analysis results

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
