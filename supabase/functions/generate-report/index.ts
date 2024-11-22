// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.20.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';
import { nanoid } from 'https://esm.sh/nanoid@5.0.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Report {
  id: string;
  insight_id: string;
  url: string;
  slug: string;
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
    optimization_opportunities: string[];
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
  next_steps?: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  improvement_areas?: Array<{
    area: string;
    details: string;
  }>;
}

interface RequestBody {
  insight_id: string;
}

interface Analysis {
  id: string;
  idea_name: string;
  problem_statement: string;
  target_audience: string;
  unique_value_proposition: string;
  product_description: string;
  total_score: number;
  validation_status: string;
  market_opportunity: {
    score: number;
    insights: Array<{
      title: string;
      description: string;
      action_steps?: string[];
    }>;
    improvement_tips?: string[];
  };
  competitive_advantage: {
    score: number;
    insights: Array<{
      title: string;
      description: string;
      action_steps?: string[];
    }>;
    improvement_tips?: string[];
  };
  feasibility: {
    score: number;
    insights: Array<{
      title: string;
      description: string;
      action_steps?: string[];
    }>;
    improvement_tips?: string[];
  };
  revenue_potential: {
    score: number;
    insights: Array<{
      title: string;
      description: string;
      action_steps?: string[];
    }>;
    improvement_tips?: string[];
  };
  market_timing: {
    score: number;
    insights: Array<{
      title: string;
      description: string;
      action_steps?: string[];
    }>;
    improvement_tips?: string[];
  };
  scalability: {
    score: number;
    insights: Array<{
      title: string;
      description: string;
      action_steps?: string[];
    }>;
    improvement_tips?: string[];
  };
  critical_issues: Array<{
    issue: string;
    recommendation: string;
  }>;
  next_steps: Array<{
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

/**
 * Utility function to retry failed operations with exponential backoff
 * Useful for handling transient API failures
 */
async function withRetry<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(operation, retries - 1, delay * 2);
  }
}

const generateSystemPrompt = (analysis: Analysis): string => {
  return `You are an experienced business advisor and startup mentor. Your task is to analyze a business idea and provide a clear, actionable report that will help the entrepreneur validate and refine their idea.

The report should be constructive and encouraging while being honest about challenges. Focus on actionable insights that lead to concrete next steps.

Here's what I know about the idea:
Problem Statement: ${analysis.problem_statement}
Target Audience: ${analysis.target_audience}
Unique Value Proposition: ${analysis.unique_value_proposition}
Product Description: ${analysis.product_description}

Previous Analysis Insights:
Market Opportunity Score: ${analysis.market_opportunity.score}/100
${analysis.market_opportunity.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Competitive Advantage Score: ${analysis.competitive_advantage.score}/100
${analysis.competitive_advantage.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Feasibility Score: ${analysis.feasibility.score}/100
${analysis.feasibility.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Revenue Potential Score: ${analysis.revenue_potential.score}/100
${analysis.revenue_potential.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Market Timing Score: ${analysis.market_timing.score}/100
${analysis.market_timing.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Scalability Score: ${analysis.scalability.score}/100
${analysis.scalability.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Critical Issues Identified:
${analysis.critical_issues.map(i => `- ${i.issue}: ${i.recommendation}`).join('\n')}

Please analyze this information and generate a comprehensive report with the following sections:

1. The Big Picture
- A concise summary of the idea and its potential
- Overall assessment score and validation status

2. What I Love About This Idea
- Key strengths and competitive advantages
- Potential impact on the market/users

3. Making Money with This Idea
- Primary monetization strategy with rationale
- Alternative revenue approaches
- Early-stage pricing and scaling strategy

4. Making Your Idea Even Stronger
- Critical questions to answer
- Areas needing more clarity or refinement

5. Real Talk: Challenges to Prepare For
- Potential pitfalls and risks
- Common mistakes in this space

6. Smart Ways to Address These Challenges
- Practical strategies to overcome each challenge
- Resources or approaches to consider

7. My Honest Take
- Clear recommendation with confidence level
- Rationale for the recommendation

8. Next Steps (if Ready to Validate) OR Areas to Improve (if Needs Refinement)
- For validation-ready ideas: Target customer profile, channels, and validation questions
- For ideas needing work: Specific areas to improve with actionable suggestions

Keep the tone encouraging but honest. Focus on actionable insights that lead to concrete next steps. The goal is to help the entrepreneur move forward confidently while being aware of potential challenges.`;
};

const generateUserPrompt = (): string => {
  return `Please generate a comprehensive business idea analysis report following the structure outlined above. The report should be detailed yet practical, with a focus on actionable insights and next steps. Make sure to include specific examples and suggestions where relevant.`;
};

/**
 * Generates a detailed analysis for a specific category of the business idea
 * Uses OpenAI's function calling feature to ensure structured output
 */
async function generateCategoryAnalysis(
  openai: OpenAI,
  category: string,
  analysis: any,
  model: string
): Promise<CategoryResponse> {
  return withRetry(async () => {
    // Map our category name to the insights field name
    const categoryToField: { [key: string]: string } = {
      marketOpportunity: 'market_opportunity',
      competitiveAdvantage: 'competitive_advantage',
      feasibility: 'feasibility',
      revenuePotential: 'revenue_potential',
      marketTiming: 'market_timing',
      scalability: 'scalability',
    };

    const fieldName = categoryToField[category];
    if (!fieldName || !analysis.insights?.[fieldName]) {
      throw new Error(`No insights found for category: ${category}`);
    }

    const categoryData = analysis.insights[fieldName];
    const criticalIssues =
      analysis.insights.critical_issues?.filter(
        issue =>
          issue.issue.toLowerCase().includes(category.toLowerCase()) ||
          issue.recommendation.toLowerCase().includes(category.toLowerCase())
      ) || [];

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt(analysis),
        },
        {
          role: 'user',
          content: generateUserPrompt(),
        },
      ],
      functions: [
        {
          name: `analyze_${category.toLowerCase()}`,
          description: `Analyze the ${category} aspects of the business idea`,
          parameters: {
            type: 'object',
            properties: {
              score: {
                type: 'number',
                description: 'Score out of 100',
              },
              strengths: {
                type: 'object',
                description: 'Key strengths and positive aspects of the idea',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'Brief summary of what makes this idea strong',
                  },
                  key_points: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Bullet points highlighting specific strengths',
                  },
                },
                required: ['summary', 'key_points'],
              },
              opportunities: {
                type: 'object',
                description: 'Key opportunities for improvement and growth',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'Brief summary of the main opportunities',
                  },
                  key_points: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Bullet points highlighting specific opportunities',
                  },
                },
                required: ['summary', 'key_points'],
              },
              questions: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Key questions to consider for refining the idea',
              },
            },
            required: ['score', 'strengths', 'opportunities', 'questions'],
          },
        },
      ],
      function_call: { name: `analyze_${category.toLowerCase()}` },
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.function_call?.arguments;
    if (!result) {
      throw new Error(`Failed to generate analysis for ${category}`);
    }

    const parsedResult = JSON.parse(result);
    // Ensure we use the exact same score from the previous analysis
    parsedResult.score = categoryData.score;
    return parsedResult;
  });
}

/**
 * Creates an executive summary that synthesizes insights across all categories
 * Takes into account the business context for a holistic evaluation
 */
async function generateExecutiveSummary(
  openai: OpenAI,
  analysis: any,
  categoryScores: CategoryResults,
  model: string
): Promise<{
  score: number;
  summary: string;
  key_strengths: { summary: string; key_points: string[] };
  key_opportunities: { summary: string; key_points: string[] };
  critical_questions: string[];
  business_context: {
    problem_statement: string;
    target_audience: string;
    value_proposition: string;
    product_description: string;
  };
}> {
  // Use the existing total score and data from the insights
  const totalScore = analysis.insights.total_score;
  const validationStatus = analysis.insights.validation_status;
  const criticalIssues = analysis.insights.critical_issues || [];
  const nextSteps = analysis.insights.next_steps || [];

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: generateSystemPrompt(analysis),
      },
      {
        role: 'user',
        content: generateUserPrompt(),
      },
    ],
    functions: [
      {
        name: 'generate_executive_summary',
        description: 'Generate an executive summary of the business idea analysis',
        parameters: {
          type: 'object',
          properties: {
            overall_score: {
              type: 'number',
              description: 'Overall score out of 100',
            },
            validation_status: {
              type: 'string',
              description: 'Current validation status of the idea',
            },
            summary: {
              type: 'string',
              description: 'Brief overview of the business idea and its potential',
            },
            key_strengths: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  description: 'Brief summary of the main strengths across all categories',
                },
                key_points: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Key strengths identified across all categories',
                },
              },
              required: ['summary', 'key_points'],
            },
            key_opportunities: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  description: 'Brief summary of the main opportunities across all categories',
                },
                key_points: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Key opportunities identified across all categories',
                },
              },
              required: ['summary', 'key_points'],
            },
            critical_questions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Most important questions to address across all categories',
            },
            business_context: {
              type: 'object',
              properties: {
                problem_statement: {
                  type: 'string',
                  description: 'Clear statement of the problem being solved',
                },
                target_audience: {
                  type: 'string',
                  description: 'Description of the target audience',
                },
                value_proposition: {
                  type: 'string',
                  description: 'Unique value proposition',
                },
                product_description: {
                  type: 'string',
                  description: 'Brief description of the product/service',
                },
              },
              required: [
                'problem_statement',
                'target_audience',
                'value_proposition',
                'product_description',
              ],
            },
          },
          required: [
            'overall_score',
            'validation_status',
            'summary',
            'key_strengths',
            'key_opportunities',
            'critical_questions',
            'business_context',
          ],
        },
      },
    ],
    function_call: { name: 'generate_executive_summary' },
  });

  const result = completion.choices[0]?.message?.function_call?.arguments;
  if (!result) {
    throw new Error('Failed to generate executive summary');
  }

  const parsedResult = JSON.parse(result);
  // Ensure we use the exact same total score from the previous analysis
  parsedResult.score = totalScore;
  return parsedResult;
}

/**
 * Generates detailed customer insights and messaging recommendations
 * Only called for high-scoring business ideas (score >= 70)
 */
async function generateCustomerInsights(openai: OpenAI, analysis: any, model: string) {
  // Get relevant insights from the previous analysis
  const marketData = analysis.insights.market_opportunity;
  const targetAudienceInsights = marketData.insights.filter(
    (insight: any) =>
      insight.title.toLowerCase().includes('customer') ||
      insight.title.toLowerCase().includes('user') ||
      insight.title.toLowerCase().includes('audience')
  );

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: generateSystemPrompt(analysis),
      },
      {
        role: 'user',
        content: generateUserPrompt(),
      },
    ],
    functions: [
      {
        name: 'generate_customer_insights',
        description:
          'Generate customer insights and messaging recommendations that build upon existing analysis',
        parameters: {
          type: 'object',
          properties: {
            customerProfile: {
              type: 'object',
              properties: {
                psychologicalProfile: {
                  type: 'string',
                  description:
                    'Deep psychological understanding of the target customer, incorporating existing market insights',
                },
                painPoints: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description:
                    'Specific pain points identified from market analysis and target audience description',
                },
                desires: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Key desires and aspirations that align with the value proposition',
                },
                transformationStory: {
                  type: 'string',
                  description:
                    "Narrative of how the product transforms the customer's life, based on problem statement and solution",
                },
              },
              required: ['psychologicalProfile', 'painPoints', 'desires', 'transformationStory'],
            },
            messaging: {
              type: 'object',
              properties: {
                valueProposition: {
                  type: 'string',
                  description: 'Core value message that resonates with the target audience',
                },
                keyMessages: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Main selling points that highlight unique benefits',
                },
                toneAndVoice: {
                  type: 'string',
                  description: 'Communication style that best connects with the target audience',
                },
                callToAction: {
                  type: 'string',
                  description: 'Primary conversion action that drives user engagement',
                },
                coreBenefits: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Key benefits that resonate with the identified customer profile',
                },
                targetedMessages: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description:
                    'Specific messages crafted for different aspects of the customer profile',
                },
                valueStatements: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Clear value statements that connect pain points to solutions',
                },
              },
              required: [
                'valueProposition',
                'keyMessages',
                'toneAndVoice',
                'callToAction',
                'coreBenefits',
                'targetedMessages',
                'valueStatements',
              ],
            },
            marketingRecommendations: {
              type: 'object',
              properties: {
                channels: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Best marketing channels to reach the target audience',
                },
                contentIdeas: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Content marketing suggestions that align with audience interests',
                },
                engagementStrategies: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'User engagement tactics to build community and loyalty',
                },
              },
              required: ['channels', 'contentIdeas', 'engagementStrategies'],
            },
            validationPlan: {
              type: 'object',
              properties: {
                hypotheses: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      statement: {
                        type: 'string',
                        description: 'Clear hypothesis statement to test',
                      },
                      metric: {
                        type: 'string',
                        description: 'How to measure this hypothesis',
                      },
                      target: {
                        type: 'string',
                        description: 'Target metric that would validate this hypothesis',
                      },
                    },
                    required: ['statement', 'metric', 'target'],
                  },
                  description: 'Key hypotheses to validate with the landing page',
                },
                successMetrics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      metric: {
                        type: 'string',
                        description: 'Name of the success metric',
                      },
                      target: {
                        type: 'string',
                        description: 'Target value or range',
                      },
                      rationale: {
                        type: 'string',
                        description: 'Why this metric matters',
                      },
                    },
                    required: ['metric', 'target', 'rationale'],
                  },
                  description: 'Key metrics to track for landing page success',
                },
                timeline: {
                  type: 'object',
                  properties: {
                    validationPeriod: {
                      type: 'string',
                      description: 'Recommended timeframe for validation',
                    },
                    milestones: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                      description: 'Key milestones in the validation process',
                    },
                  },
                  required: ['validationPeriod', 'milestones'],
                },
              },
              required: ['hypotheses', 'successMetrics', 'timeline'],
            },
            nextSteps: {
              type: 'object',
              properties: {
                immediate: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      action: {
                        type: 'string',
                        description: 'Specific action to take',
                      },
                      impact: {
                        type: 'string',
                        description: 'Expected impact of this action',
                      },
                      timeline: {
                        type: 'string',
                        description: 'When this should be done',
                      },
                    },
                    required: ['action', 'impact', 'timeline'],
                  },
                  description: 'Immediate next steps to take',
                },
                landingPageChecklist: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Key elements to include in the landing page',
                },
                riskMitigation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      risk: {
                        type: 'string',
                        description: 'Potential risk to address',
                      },
                      mitigation: {
                        type: 'string',
                        description: 'Strategy to mitigate this risk',
                      },
                    },
                    required: ['risk', 'mitigation'],
                  },
                  description: 'Strategies to mitigate identified risks',
                },
              },
              required: ['immediate', 'landingPageChecklist', 'riskMitigation'],
            },
          },
          required: [
            'customerProfile',
            'messaging',
            'marketingRecommendations',
            'validationPlan',
            'nextSteps',
          ],
        },
      },
    ],
    function_call: { name: 'generate_customer_insights' },
  });

  const result = completion.choices[0]?.message?.function_call?.arguments;
  if (!result) {
    throw new Error('Failed to generate customer insights');
  }

  return JSON.parse(result);
}

/**
 * Validates that an analysis object contains all required fields
 * Throws an error if any required field is missing or invalid
 */
function validateAnalysis(analysis: any): analysis is Analysis {
  const requiredFields = [
    'id',
    'idea_name',
    'problem_statement',
    'target_audience',
    'unique_value_proposition',
    'product_description',
    'total_score',
    'validation_status',
    'market_opportunity',
    'competitive_advantage',
    'feasibility',
    'revenue_potential',
    'market_timing',
    'scalability',
    'critical_issues',
  ];

  const missingFields = requiredFields.filter(field => !analysis[field]);
  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return false;
  }

  // Validate category scores and insights
  const categoryFields = [
    'market_opportunity',
    'competitive_advantage',
    'feasibility',
    'revenue_potential',
    'market_timing',
    'scalability',
  ];

  for (const field of categoryFields) {
    const category = analysis[field];
    if (!category.score || !Array.isArray(category.insights)) {
      console.error(`Invalid ${field} data:`, category);
      return false;
    }
  }

  // Validate arrays
  if (!Array.isArray(analysis.critical_issues)) {
    console.error('critical_issues must be an array');
    return false;
  }

  return true;
}

/**
 * Main report generation function that orchestrates the entire analysis process:
 * 1. Analyzes multiple business categories in parallel
 * 2. Generates an executive summary
 * 3. Optionally generates customer insights for high-scoring ideas
 */
async function generateReport(analysis: Analysis, supabaseClient: SupabaseClient): Promise<Report> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini-2024-07-18';

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const openai = new OpenAI({ apiKey });

  try {
    console.log('📝 Starting report generation process...');
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt(analysis),
        },
        {
          role: 'user',
          content: generateUserPrompt(),
        },
      ],
      functions: [
        {
          name: 'generate_report',
          description: 'Generate a comprehensive business idea analysis report',
          parameters: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              insight_id: { type: 'string' },
              url: { type: 'string' },
              summary: { type: 'string' },
              key_strengths: {
                type: 'object',
                properties: {
                  summary: { type: 'string' },
                  points: { type: 'array', items: { type: 'string' } },
                  potential_impact: { type: 'string' },
                },
                required: ['summary', 'points', 'potential_impact'],
              },
              monetization: {
                type: 'object',
                properties: {
                  primary_stream: {
                    type: 'object',
                    properties: {
                      approach: { type: 'string' },
                      rationale: { type: 'string' },
                      pricing: { type: 'string' },
                      benefits: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['approach', 'rationale', 'pricing', 'benefits'],
                  },
                  alternative_approaches: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        model: { type: 'string' },
                        implementation: { type: 'string' },
                        best_for: { type: 'string' },
                        pricing: { type: 'string' },
                        pros: { type: 'array', items: { type: 'string' } },
                        cons: { type: 'array', items: { type: 'string' } },
                      },
                      required: ['model', 'implementation', 'best_for', 'pricing', 'pros', 'cons'],
                    },
                  },
                  optimization_opportunities: { type: 'string' },
                  early_stage_strategy: {
                    type: 'object',
                    properties: {
                      initial_approach: { type: 'string' },
                      key_metrics: { type: 'array', items: { type: 'string' } },
                      adjustment_triggers: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['initial_approach', 'key_metrics', 'adjustment_triggers'],
                  },
                },
                required: [
                  'primary_stream',
                  'alternative_approaches',
                  'optimization_opportunities',
                  'early_stage_strategy',
                ],
              },
              refinement_questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    context: { type: 'string' },
                  },
                  required: ['question', 'context'],
                },
                minItems: 1,
              },
              challenges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    challenge: { type: 'string' },
                    description: { type: 'string' },
                  },
                  required: ['challenge', 'description'],
                },
                minItems: 1,
              },
              mitigation_strategies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    strategy: { type: 'string' },
                    details: { type: 'string' },
                  },
                  required: ['strategy', 'details'],
                },
                minItems: 1,
              },
              recommendation: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  priority: { type: 'string' },
                  timeline: { type: 'string' },
                },
                required: ['recommendation', 'priority', 'timeline'],
              },
              next_steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    priority: { type: 'string' },
                  },
                  required: ['title', 'description', 'priority'],
                },
              },
              improvement_areas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    area: { type: 'string' },
                    details: { type: 'string' },
                  },
                  required: ['area', 'details'],
                },
              },
            },
            required: [
              'summary',
              'key_strengths',
              'monetization',
              'refinement_questions',
              'challenges',
              'mitigation_strategies',
              'recommendation',
            ],
          },
        },
      ],
      function_call: { name: 'generate_report' },
    });

    const result = completion.choices[0]?.message?.function_call?.arguments;
    if (!result) {
      if (completion.choices[0]?.message?.refusal) {
        console.error('Model refused to generate report:', completion.choices[0].message.refusal);
        throw new Error('Failed to generate report: ' + completion.choices[0].message.refusal);
      }
      throw new Error('Failed to generate report: No result returned');
    }

    console.log('Raw report data:', result);
    const parsedResult = JSON.parse(result);

    // Generate report ID and URL
    const reportId = uuidv4();
    const isDevelopment =
      Deno.env.get('SUPABASE_URL')?.includes('localhost') ||
      Deno.env.get('SUPABASE_URL')?.includes('127.0.0.1');
    const baseUrl = isDevelopment ? 'http://localhost:3000' : Deno.env.get('PUBLIC_APP_URL');
    const reportUrl = `${baseUrl}/idea/report/${reportId}`;

    // Ensure all required arrays are initialized
    const report: Report = {
      ...parsedResult,
      id: reportId,
      url: reportUrl,
      refinement_questions: parsedResult.refinement_questions || [],
      challenges: parsedResult.challenges || [],
      mitigation_strategies: parsedResult.mitigation_strategies || [],
      next_steps: parsedResult.next_steps || [],
      improvement_areas: parsedResult.improvement_areas || [],
      recommendation: parsedResult.recommendation || {
        recommendation: '',
        priority: '',
        timeline: '',
      },
    };

    console.log('Processed report data:', report);
    return report;
  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
}

/**
 * Handles incoming HTTP requests:
 * 1. Validates request data
 * 2. Retrieves analysis from database
 * 3. Generates report
 * 4. Updates database with report data
 * 5. Creates secure URL for report access
 */
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { insight_id } = (await req.json()) as RequestBody;
    console.log('📝 Starting report generation process:', { insight_id });

    if (!insight_id) {
      throw new Error('Insight ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔌 Connected to Supabase, fetching insight...');

    // Fetch the insight from the database
    const { data: insightData, error: insightError } = await supabaseClient
      .from('idea_insights')
      .select('*')
      .eq('id', insight_id)
      .single();

    if (insightError) {
      console.error('❌ Failed to fetch insight:', insightError);
      throw insightError;
    }

    if (!insightData) {
      console.error('❌ No insight found for ID:', insight_id);
      throw new Error('Insight not found');
    }

    console.log('✅ Insight retrieved successfully');

    // Validate the insight data
    if (!validateAnalysis(insightData)) {
      console.error('❌ Invalid insight data:', insightData);
      throw new Error('Invalid insight data');
    }

    console.log('✅ Insight data validated, generating report...');
    const report = await generateReport(insightData, supabaseClient);
    console.log('✅ Report generated successfully');

    // Generate unique identifiers
    const isDevelopment =
      Deno.env.get('SUPABASE_URL')?.includes('localhost') ||
      Deno.env.get('SUPABASE_URL')?.includes('127.0.0.1');
    const baseUrl = isDevelopment ? 'http://localhost:3000' : Deno.env.get('PUBLIC_APP_URL');
    const reportUrl = `${baseUrl}/idea/report/${report.id}`;

    // Store the report in idea_reports
    console.log('🔄 Storing report...');
    const { data: reportData, error: reportError } = await supabaseClient
      .from('idea_reports')
      .insert({
        id: report.id,
        insight_id: insight_id,
        url: reportUrl,
        summary: report.summary,
        key_strengths: report.key_strengths,
        monetization: report.monetization,
        refinement_questions: report.refinement_questions,
        challenges: report.challenges,
        mitigation_strategies: report.mitigation_strategies,
        recommendation: report.recommendation,
        improvement_areas: report.improvement_areas || [],
      })
      .select()
      .single();

    if (reportError) {
      console.error('❌ Failed to store report:', reportError);
      throw reportError;
    }

    console.log('✅ Report stored successfully');

    // Log the report URL for manual access
    console.log('📋 Report URL:', reportUrl);

    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
        reportUrl: reportUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in handleRequest:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}

serve(handleRequest);
