import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/libs/supabase/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema for the request body
const ReportRequestSchema = z.object({
  analysisId: z.string(),
});

// Define the structure we want from OpenAI
const REPORT_SCHEMA = {
  name: 'validation_roadmap',
  description: 'Generate a practical validation roadmap for a startup idea',
  parameters: {
    type: 'object',
    properties: {
      // Validation Strategy
      validationStrategy: {
        type: 'object',
        description: 'Overall validation strategy and approach',
        properties: {
          summary: { type: 'string' },
          keyObjectives: {
            type: 'array',
            items: { type: 'string' },
          },
          timeline: { type: 'string' },
        },
        required: ['summary', 'keyObjectives', 'timeline'],
      },
      // Customer Validation
      customerValidation: {
        type: 'object',
        description: 'Steps to validate customer needs and willingness to pay',
        properties: {
          targetSegments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                segment: { type: 'string' },
                characteristics: { type: 'string' },
                findingChannels: { type: 'string' },
              },
              required: ['segment', 'characteristics', 'findingChannels'],
            },
          },
          interviewQuestions: {
            type: 'array',
            items: { type: 'string' },
          },
          successMetrics: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['targetSegments', 'interviewQuestions', 'successMetrics'],
      },
      // Solution Validation
      solutionValidation: {
        type: 'object',
        description: 'Steps to validate the proposed solution',
        properties: {
          mvpFeatures: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                feature: { type: 'string' },
                purpose: { type: 'string' },
                testingApproach: { type: 'string' },
              },
              required: ['feature', 'purpose', 'testingApproach'],
            },
          },
          testingMethods: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                method: { type: 'string' },
                description: { type: 'string' },
                expectedOutcome: { type: 'string' },
              },
              required: ['method', 'description', 'expectedOutcome'],
            },
          },
        },
        required: ['mvpFeatures', 'testingMethods'],
      },
      // Market Validation
      marketValidation: {
        type: 'object',
        description: 'Steps to validate market size and competition',
        properties: {
          marketResearch: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                sources: { type: 'string' },
                metrics: { type: 'string' },
              },
              required: ['area', 'sources', 'metrics'],
            },
          },
          competitorAnalysis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                competitor: { type: 'string' },
                strengths: { type: 'string' },
                weaknesses: { type: 'string' },
              },
              required: ['competitor', 'strengths', 'weaknesses'],
            },
          },
        },
        required: ['marketResearch', 'competitorAnalysis'],
      },
      // Risks and Mitigation
      risks: {
        type: 'array',
        description: 'Key risks and mitigation strategies',
        items: {
          type: 'object',
          properties: {
            risk: { type: 'string' },
            impact: { type: 'string' },
            mitigationStrategy: { type: 'string' },
          },
          required: ['risk', 'impact', 'mitigationStrategy'],
        },
      },
      // Validation Status
      validationStatus: {
        type: 'string',
        enum: ['READY TO VALIDATE', 'NEEDS REFINEMENT', 'MAJOR CONCERNS'],
      },
      // Critical Issues
      criticalIssues: {
        type: 'array',
        description: 'Critical issues that must be addressed',
        items: {
          type: 'object',
          properties: {
            issue: { type: 'string' },
            impact: { type: 'string' },
            recommendation: { type: 'string' },
          },
          required: ['issue', 'impact', 'recommendation'],
        },
      },
      // Next Steps Report
      nextStepsReport: {
        type: 'array',
        description: 'Prioritized next steps for validation',
        items: {
          type: 'object',
          properties: {
            step: { type: 'string' },
            details: { type: 'string' },
            priority: {
              type: 'string',
              enum: ['HIGH', 'MEDIUM', 'LOW'],
            },
          },
          required: ['step', 'details', 'priority'],
        },
      },
    },
    required: [
      'validationStrategy',
      'customerValidation',
      'solutionValidation',
      'marketValidation',
      'risks',
      'validationStatus',
      'criticalIssues',
      'nextStepsReport',
    ],
  },
};

export async function POST(request: Request) {
  try {
    console.log('Starting detailed report generation...');

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const validatedData = ReportRequestSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Get the analysis data from Supabase
    const supabase = createClient();
    const { data: analysis, error: analysisError } = await supabase
      .from('idea_analyses')
      .select('*')
      .eq('id', validatedData.analysisId)
      .single();

    if (analysisError || !analysis) {
      console.error('Error fetching analysis:', analysisError);
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Generate AI insights with structured output
    console.log('Calling OpenAI with schema:', JSON.stringify(REPORT_SCHEMA, null, 2));

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are UseLaunchLab's practical startup validator. Your job is to help entrepreneurs bridge the gap between "idea" and "real validation" by providing actionable guidance focused on their next steps.

Your task is to create a Validation Roadmap that gives entrepreneurs everything they need to start testing their idea with real users. No theoretical frameworks, no complex business plans - just practical steps to get real feedback fast.

Structure your analysis around these key areas:

1. Validation Strategy
- Create a clear, actionable plan for validating the idea
- Break down key objectives into measurable goals
- Set realistic timelines for validation activities

2. Customer Validation
- Define clear target customer segments
- Create interview questions that get to the heart of the problem
- Set success metrics for customer validation

3. Solution Validation
- Define MVP features that test core assumptions
- Create specific testing methods for each feature
- Set clear expected outcomes for testing

4. Market Validation
- Identify key market research areas and sources
- Analyze direct and indirect competitors
- Set market size and growth metrics to validate

5. Risks and Critical Issues
- Identify potential showstoppers early
- Provide practical mitigation strategies
- Highlight critical issues that need immediate attention

6. Next Steps
- Prioritize actions based on impact and urgency
- Provide specific, actionable next steps
- Set clear success criteria for each step

Keep your recommendations:
 Practical and actionable
 Focused on real-world validation
 Specific to the idea's context
 Prioritized by impact

Remember: We're here to help entrepreneurs take concrete steps toward validation, not to create theoretical frameworks or business plans.`,
        },
        {
          role: 'user',
          content: `Generate a validation roadmap for this idea based on the previous analysis:

Problem Statement: ${analysis.problem_statement}
Target Audience: ${analysis.target_audience}
Unique Value Proposition: ${analysis.unique_value_proposition}
Product Description: ${analysis.product_description}

Previous Analysis Insights:
${JSON.stringify(analysis.insights, null, 2)}`,
        },
      ],
      temperature: 0.7,
      function_call: { name: 'validation_roadmap' },
      functions: [
        {
          name: 'validation_roadmap',
          description: 'Generate a practical validation roadmap for a startup idea',
          parameters: REPORT_SCHEMA.parameters,
        },
      ],
    });

    console.log('OpenAI response:', JSON.stringify(completion, null, 2));

    // Parse the response
    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call in response');
    }

    const reportData = JSON.parse(functionCall.arguments);

    // Update the analysis with the report data
    const { error: updateError } = await supabase
      .from('idea_analyses')
      .update({
        report_data: reportData,
        report_generated: true,
      })
      .eq('id', validatedData.analysisId);

    if (updateError) {
      console.error('Error updating analysis:', updateError);
      throw updateError;
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
