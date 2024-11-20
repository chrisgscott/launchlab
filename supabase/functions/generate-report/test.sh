#!/bin/bash

# Create a test analysis and get its ID
RESPONSE=$(curl -s -X POST \
  'http://localhost:54321/rest/v1/idea_analyses' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "problem_statement": "Test problem",
    "target_audience": "Test audience",
    "unique_value_proposition": "Test value prop",
    "product_description": "Test product",
    "insights": {
      "marketOpportunity": "High potential market opportunity",
      "competitiveAdvantage": "Strong competitive advantage",
      "feasibility": "Medium feasibility",
      "revenuePotential": "High revenue potential",
      "marketTiming": "Good market timing",
      "scalability": "High scalability",
      "totalScore": 85,
      "validationStatus": "NEEDS REFINEMENT",
      "criticalIssues": ["Issue 1", "Issue 2"],
      "nextSteps": ["Step 1", "Step 2"],
      "oneLiner": "Test one liner",
      "uniqueValueInsights": [],
      "differentiators": [],
      "targetAudienceInsights": [],
      "painPoints": [],
      "headlines": [],
      "keyBenefits": [],
      "successMetrics": [],
      "successStories": [],
      "marketOpportunities": [],
      "risks": [],
      "nextStepsReport": []
    }
  }')

echo "Response from create: $RESPONSE"
ANALYSIS_ID=$(echo "$RESPONSE" | jq -r '.[0].id')

echo "Created test analysis with ID: $ANALYSIS_ID"

# Test the generate-report function with the new analysis ID
curl -i --request POST \
  'http://localhost:54321/functions/v1/generate-report' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data-raw "{
    \"analysisId\": \"$ANALYSIS_ID\",
    \"email\": \"test@example.com\"
  }"
