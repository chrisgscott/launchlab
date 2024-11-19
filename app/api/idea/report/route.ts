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

// Define the structure we want from OpenAI for the detailed report
const REPORT_SCHEMA = {
  name: 'validation_roadmap',
  description: 'Generate a practical validation roadmap for a startup idea',
  parameters: {
    type: 'object',
    properties: {
      // Idea Refinement & Positioning
      oneLiner: {
        type: 'string',
        description: 'A clear, compelling one-line description of the idea',
      },
      uniqueValueInsights: {
        type: 'array',
        description: 'Key aspects of the unique value proposition',
        items: { type: 'string' },
      },
      differentiators: {
        type: 'array',
        description: 'Key differentiators from existing solutions',
        items: { type: 'string' },
      },

      // Target Customer
      targetAudienceInsights: {
        type: 'array',
        description: 'Detailed insights about the ideal early adopter',
        items: { type: 'string' },
      },
      painPoints: {
        type: 'array',
        description: 'Current pain points and solutions used by the target audience',
        items: { type: 'string' },
      },

      // Landing Page Blueprint
      headlines: {
        type: 'array',
        description: 'Compelling headline options for the landing page',
        items: { type: 'string' },
      },
      keyBenefits: {
        type: 'array',
        description: 'Key benefits to highlight on the landing page',
        items: { type: 'string' },
      },

      // Validation Plan
      nextSteps: {
        type: 'array',
        description: 'Concrete next steps for the 30-day validation plan',
        items: { type: 'string' },
      },
      successMetrics: {
        type: 'array',
        description: 'Specific metrics to aim for during validation',
        items: { type: 'string' },
      },

      // Confidence Boosters
      successStories: {
        type: 'array',
        description: 'Examples of similar products/companies that started small',
        items: { type: 'string' },
      },

      // Overall Analysis
      totalScore: {
        type: 'number',
        description: 'Validation readiness score out of 100',
      },
      marketOpportunities: {
        type: 'array',
        description: 'Key market opportunities identified',
        items: { type: 'string' },
      },
      risks: {
        type: 'array',
        description: 'Potential risks and challenges to address',
        items: { type: 'string' },
      },
      validationStatus: {
        type: 'string',
        enum: ['READY TO VALIDATE', 'NEEDS REFINEMENT', 'MAJOR CONCERNS'],
        description: 'Overall validation status based on total score',
      },
      criticalIssues: {
        type: 'array',
        description: 'Critical issues that need immediate attention',
        items: {
          type: 'object',
          properties: {
            issue: { type: 'string' },
            recommendation: { type: 'string' },
          },
          required: ['issue', 'recommendation'],
        },
      },
      nextStepsReport: {
        type: 'array',
        description: 'Prioritized next steps with detailed descriptions',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          },
          required: ['title', 'description', 'priority'],
        },
      },
    },
    required: [
      'oneLiner',
      'uniqueValueInsights',
      'differentiators',
      'targetAudienceInsights',
      'painPoints',
      'headlines',
      'keyBenefits',
      'nextSteps',
      'successMetrics',
      'successStories',
      'totalScore',
      'marketOpportunities',
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
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        {
          role: 'system',
          content: `You are UseLaunchLab's practical startup validator. Your job is to help entrepreneurs bridge the gap between "idea" and "real validation" by providing actionable guidance focused on their next steps.

Your task is to create a Validation Roadmap that gives entrepreneurs everything they need to start testing their idea with real users. No theoretical frameworks, no complex business plans - just practical steps to get real feedback fast.

Structure your analysis around these key areas:

1. Idea Refinement & Positioning
- Craft a clear, compelling one-liner that instantly communicates value
- Identify unique value propositions that will resonate with early adopters
- Highlight key differentiators from existing solutions
- Address common objections they'll face

2. Target Customer Deep-Dive
- Build a detailed profile of their ideal early adopter
- Identify where these customers hang out online and offline
- Capture the exact language/terms customers use to describe their problem
- Map out current solutions and pain points

3. Landing Page Blueprint
- Create headline options that will grab attention
- List key benefits that will resonate with the target audience
- Identify social proof elements they should gather
- Suggest effective call-to-action strategies

4. Quick-Start Validation Plan
- Outline a 30-day validation timeline
- Identify the first 3 places to share their landing page
- Provide templates/scripts for reaching out to potential customers
- Set clear success metrics to aim for

5. Confidence Boosters
- Share examples of similar products/companies that started small
- Highlight common pivots that led to success
- Show real examples of early landing pages from now-successful companies

For each section:
1. Be specific and actionable - no vague advice
2. Focus on immediate next steps they can take
3. Provide examples and templates where possible
4. Address common fears and objections

Calculate a validation readiness score out of 100 based on:
- Clarity of value proposition (25%)
- Understanding of target customer (25%)
- Ease of initial validation (25%)
- Market timing and opportunity (25%)

Determine the validation status:
- 70-100: READY TO VALIDATE - Begin validation immediately
- 50-69: NEEDS REFINEMENT - Address key issues first
- <50: MAJOR CONCERNS - Rethink core assumptions

Keep your tone:
 Practical and action-oriented
 Encouraging but realistic
 Focused on immediate next steps
 Empowering without sugar-coating

Remember: Your goal is to give them confidence through clarity and concrete action steps. Help them move from "I think this could work" to "I know exactly how to test this."`,
        },
        {
          role: 'user',
          content: `Generate a detailed validation roadmap for this business idea:
    
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
