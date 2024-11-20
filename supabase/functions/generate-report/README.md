# Report Generation Edge Function

This Edge Function handles the generation of validation roadmap reports using OpenAI's GPT models.

## Environment Variables

Required environment variables for local development:

```env
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o-mini-2024-07-18  # DO NOT CHANGE: Optimized for our specific use case
BREVO_API_KEY=your-brevo-key
PUBLIC_APP_URL=http://localhost:3000
DB_URL=http://localhost:54321
DB_SERVICE_KEY=your-service-key
```

## Model Choice

We specifically use `gpt-4o-mini-2024-07-18` as it is:

1. Optimized for our validation roadmap generation use case
2. Provides the best balance of performance and cost
3. Maintains consistent output format required by our application

DO NOT change this model without thorough testing and approval.
