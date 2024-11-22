import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/libs/supabase/server';

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18';

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Validation schema for the request body
const AnalyzeRequestSchema = z.object({
  idea_name: z.string(),
  problem_statement: z.string(),
  target_audience: z.string(),
  unique_value_proposition: z.string(),
  product_description: z.string(),
});

// Define the structure we want from OpenAI
const ANALYSIS_SCHEMA = {
  name: 'startup_analysis',
  description: 'Analyze a startup idea and provide structured insights',
  parameters: {
    type: 'object',
    properties: {
      // Core Factors (60% of total)
      market_opportunity: {
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
                action_steps: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['title', 'description'],
            },
          },
          improvement_tips: {
            type: 'array',
            description: 'Three brief, actionable tips for improvement',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
        },
        required: ['score', 'insights', 'improvement_tips'],
      },
      competitive_advantage: {
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
                action_steps: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['title', 'description'],
            },
          },
          improvement_tips: {
            type: 'array',
            description: 'Three brief, actionable tips for improvement',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
        },
        required: ['score', 'insights', 'improvement_tips'],
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
                action_steps: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['title', 'description'],
            },
          },
          improvement_tips: {
            type: 'array',
            description: 'Three brief, actionable tips for improvement',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
        },
        required: ['score', 'insights', 'improvement_tips'],
      },
      // Supporting Factors (40% of total)
      revenue_potential: {
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
                action_steps: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['title', 'description'],
            },
          },
          improvement_tips: {
            type: 'array',
            description: 'Three brief, actionable tips for improvement',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
        },
        required: ['score', 'insights', 'improvement_tips'],
      },
      market_timing: {
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
                action_steps: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['title', 'description'],
            },
          },
          improvement_tips: {
            type: 'array',
            description: 'Three brief, actionable tips for improvement',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
        },
        required: ['score', 'insights', 'improvement_tips'],
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
                action_steps: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['title', 'description'],
            },
          },
          improvement_tips: {
            type: 'array',
            description: 'Three brief, actionable tips for improvement',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
        },
        required: ['score', 'insights', 'improvement_tips'],
      },
      // Overall Analysis
      total_score: {
        type: 'number',
        description: 'Calculated total score out of 100',
      },
      validation_status: {
        type: 'string',
        enum: ['READY TO VALIDATE', 'NEEDS REFINEMENT', 'MAJOR CONCERNS'],
        description: 'Overall validation status based on total score',
      },
      critical_issues: {
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
    },
    required: [
      'market_opportunity',
      'competitive_advantage',
      'feasibility',
      'revenue_potential',
      'market_timing',
      'scalability',
      'total_score',
      'validation_status',
      'critical_issues',
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
      model: model,
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
2. Provide insights that cover:
   - Current State: What's working/not working
   - Impact: Why this matters for success
   - Action Steps: Specific things to do next
3. Provide exactly 3 improvement tips that are:
   - One sentence each (15-20 words)
   - Actionable and specific
   - Quick wins that hint at deeper strategies
   - Focused on the most impactful changes first

Calculate a total score out of 100 using the weighted factors and determine the status:
- 70-100: READY TO VALIDATE - You're onto something big here
- 50-69: NEEDS REFINEMENT - Promising, but needs some work
- <50: MAJOR CONCERNS - Time to pivot - here's why

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
    
Idea Name: ${validatedData.idea_name}
Problem Statement: ${validatedData.problem_statement}
Target Audience: ${validatedData.target_audience}
Unique Value Proposition: ${validatedData.unique_value_proposition}
Product Description: ${validatedData.product_description}`,
        },
      ],
      temperature: 0.7,
      function_call: { name: 'startup_analysis' },
      functions: [
        {
          name: 'startup_analysis',
          description: 'Analyze a startup idea and provide structured insights',
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
    const score = analysis.total_score;
    analysis.validation_status =
      score >= 70 ? 'READY TO VALIDATE' : score >= 50 ? 'NEEDS REFINEMENT' : 'MAJOR CONCERNS';

    console.log('Parsed analysis:', JSON.stringify(analysis, null, 2));

    // Save to Supabase
    const supabase = createClient();
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('idea_insights')
      .insert({
        idea_name: validatedData.idea_name,
        problem_statement: validatedData.problem_statement,
        target_audience: validatedData.target_audience,
        unique_value_proposition: validatedData.unique_value_proposition,
        product_description: validatedData.product_description,
        total_score: Math.round(analysis.total_score),
        validation_status: analysis.validation_status,
        market_opportunity: analysis.market_opportunity,
        competitive_advantage: analysis.competitive_advantage,
        feasibility: analysis.feasibility,
        revenue_potential: analysis.revenue_potential,
        market_timing: analysis.market_timing,
        scalability: analysis.scalability,
        critical_issues: analysis.critical_issues,
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
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to analyze idea' }, { status: 500 });
  }
}
