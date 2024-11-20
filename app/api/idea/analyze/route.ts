import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/libs/supabase/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema for the request body
const AnalyzeRequestSchema = z.object({
  problemStatement: z.string(),
  targetAudience: z.string(),
  uniqueValueProposition: z.string(),
  productDescription: z.string(),
});

// Define the structure we want from OpenAI
const ANALYSIS_SCHEMA = {
  name: 'startup_analysis',
  description: 'Analyze a startup idea and provide structured insights with a space launch theme',
  parameters: {
    type: 'object',
    properties: {
      // Core Factors (60% of total)
      marketOpportunity: {
        type: 'object',
        description: 'Market size and growth potential (25% of total score)',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['score', 'insights'],
      },
      competitiveAdvantage: {
        type: 'object',
        description: 'Unique value proposition and barriers to entry (20% of total score)',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['score', 'insights'],
      },
      feasibility: {
        type: 'object',
        description: 'Technical and operational complexity (15% of total score)',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['score', 'insights'],
      },
      // Supporting Factors (40% of total)
      revenuePotential: {
        type: 'object',
        description: 'Revenue model and financial projections (15% of total score)',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['score', 'insights'],
      },
      marketTiming: {
        type: 'object',
        description: 'Current market conditions and technological readiness (15% of total score)',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['score', 'insights'],
      },
      scalability: {
        type: 'object',
        description: 'Growth potential and operational complexity (10% of total score)',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['score', 'insights'],
      },
      // Overall Analysis
      totalScore: {
        type: 'number',
        description: 'Calculated total score out of 100',
      },
      validationStatus: {
        type: 'string',
        enum: ['READY TO VALIDATE', 'NEEDS REFINEMENT', 'MAJOR CONCERNS'],
        description: 'Overall validation status based on total score',
      },
      criticalIssues: {
        type: 'array',
        description: 'List of critical issues that could be immediate disqualifiers',
        items: {
          type: 'object',
          properties: {
            issue: { type: 'string' },
            recommendation: { type: 'string' },
          },
          required: ['issue', 'recommendation'],
        },
      },
      nextSteps: {
        type: 'array',
        description: 'Recommended next steps based on the analysis',
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
      'marketOpportunity',
      'competitiveAdvantage',
      'feasibility',
      'revenuePotential',
      'marketTiming',
      'scalability',
      'totalScore',
      'validationStatus',
      'criticalIssues',
      'nextSteps',
    ],
  },
};

export async function POST(request: Request) {
  try {
    console.log('Starting idea analysis...');

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const validatedData = AnalyzeRequestSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Generate AI insights with structured output
    console.log('Calling OpenAI with schema:', JSON.stringify(ANALYSIS_SCHEMA, null, 2));

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18',
      messages: [
        {
          role: 'system',
          content: `You are UseLaunchLab's straight-talking startup analyzer. You cut through the BS and give entrepreneurs honest, actionable feedback about their ideas. Your analysis should feel like advice from a smart friend who has been there before - direct but supportive, honest but constructive.

Your task is to analyze startup ideas across several key factors, scoring each one and providing specific insights that actually help. No corporate jargon, no sugarcoating, just real talk about what works and what needs work.

Core Factors (60% of total):
1. Market Opportunity (25%)
- Is there a real problem here that people will pay to solve?
- How big could this actually get?
- Are people actively looking for solutions right now?

2. Competitive Advantage (20%)
- What makes this genuinely different?
- Can it stay ahead of copycats?
- Is there a real moat or just wishful thinking?

3. Feasibility (15%)
- Can this actually be built with current tech?
- What resources are needed to make it happen?
- How long until this could be in users' hands?

Supporting Factors (40% of total):
4. Revenue Potential (15%)
- Is there a clear path to making money?
- Will people actually pay what you need to charge?
- How sustainable is the revenue model?

5. Market Timing (15%)
- Why now? What's changed?
- Are users ready for this?
- What market trends support or threaten this idea?

6. Scalability (10%)
- Can this grow without breaking?
- What breaks first when this scales?
- Is the growth path realistic?

For each factor:
1. Score it 0-100 (0=Needs serious work, 100=Absolutely crushing it)
2. For scores of 50 or below, provide:
   - What's holding this factor back
   - Specific actions to improve the score
   - Examples or suggestions when relevant
3. For scores of 51 or above, provide:
   - What's working well
   - How to maintain or enhance this strength
   - Potential risks to watch out for

Your insights for each factor should follow this structure:
- Current State: What's working/not working
- Impact: Why this matters for success
- Action Steps: Specific things to do next

Calculate a total score out of 100 using the weighted factors and determine the status:
- 70-100: You're onto something big here
- 50-69: Promising, but needs some work
- <50: Time to pivot - here's why

Call out any major red flags that could kill this idea:
- Legal/regulatory roadblocks
- Ethical concerns
- Technical impossibility
- Market dominance by big players

Provide next steps prioritized as:
HIGH priority: Do this ASAP - it's make or break
MEDIUM priority: Important for growth
LOW priority: Nice to have, but not crucial yet

Keep your tone:
✓ Direct but not harsh
✓ Optimistic but realistic
✓ Smart but not condescending
✓ Supportive but not sugarcoating

Remember: We're here to help entrepreneurs succeed, not to crush dreams or blow smoke. Give them the honest feedback they need to make their idea the best it can be.`,
        },
        {
          role: 'user',
          content: `Analyze this business idea:
    
Problem Statement: ${validatedData.problemStatement}
Target Audience: ${validatedData.targetAudience}
Unique Value Proposition: ${validatedData.uniqueValueProposition}
Product Description: ${validatedData.productDescription}`,
        },
      ],
      temperature: 0.7,
      function_call: { name: 'startup_analysis' },
      functions: [
        {
          name: 'startup_analysis',
          description:
            'Analyze a startup idea and provide structured insights with a space launch theme',
          parameters: ANALYSIS_SCHEMA.parameters,
        },
      ],
    });

    console.log('OpenAI response:', JSON.stringify(completion, null, 2));

    // Handle potential refusal
    const message = completion.choices[0].message;
    if (message.refusal) {
      console.log('OpenAI refused to analyze:', message.refusal);
      return NextResponse.json({ error: message.refusal }, { status: 400 });
    }

    // Parse the function call response
    if (!message.function_call) {
      console.error('No function call in response');
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    console.log('Function call arguments:', message.function_call.arguments);
    const analysis = JSON.parse(message.function_call.arguments);

    // Map the validation status to our allowed values
    const score = analysis.totalScore;
    analysis.validationStatus =
      score >= 70 ? 'READY TO VALIDATE' : score >= 50 ? 'NEEDS REFINEMENT' : 'MAJOR CONCERNS';

    console.log('Parsed analysis:', JSON.stringify(analysis, null, 2));

    // Save to Supabase
    const supabase = createClient();
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('idea_analyses')
      .insert({
        problem_statement: validatedData.problemStatement,
        target_audience: validatedData.targetAudience,
        unique_value_proposition: validatedData.uniqueValueProposition,
        product_description: validatedData.productDescription,
        insights: analysis,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
    }

    // Return the analysis ID for redirection
    return NextResponse.json({ id: savedAnalysis.id }, { status: 200 });
  } catch (error) {
    console.error('Error analyzing idea:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    if (error instanceof z.ZodError) {
      console.log('Validation error:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
