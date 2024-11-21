// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.20.1';
import { nanoid } from 'https://esm.sh/nanoid@5.0.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Report {
  id: string;
  overall_score: number;
  validation_status: 'Ready to Validate' | 'Needs Refinement' | 'Major Concerns';
  
  // The Big Picture
  summary: string;
  
  // What I Love About This Idea
  key_strengths: {
    summary: string;
    points: string[];
    potential_impact: string;
  };
  
  // Making Money with This Idea
  monetization: {
    primary_stream: {
      approach: string;
      rationale: string;
      pricing: string;
      benefits: string[];
    };
    alternative_approaches: Array<{
      model: 'Subscription' | 'One-Time Purchase' | 'Freemium';
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
  
  // Making Your Idea Even Stronger
  refinement_questions: string[];
  
  // Real Talk: Challenges to Prepare For
  challenges: {
    potential_pitfalls: Array<{
      challenge: string;
      context: string;
    }>;
    common_gotchas: Array<{
      issue: string;
      prevention: string;
    }>;
  };
  
  // Smart Ways to Address These Challenges
  mitigation_strategies: Array<{
    challenge: string;
    actions: string[];
  }>;
  
  // My Honest Take
  recommendation: {
    verdict: string;
    confidence: 'High' | 'Medium' | 'Low';
    rationale: string;
  };
  
  // Your Next Steps (if Ready to Validate)
  next_steps?: {
    ideal_customers: {
      profile: string;
      channels: string[];
      influencers: string[];
      pain_points: string[];
      approach_strategy: string;
    };
    validation_questions: string[];
  };
  
  // Areas to Improve (if Needs Refinement)
  improvement_areas?: Array<{
    area: string;
    suggestions: string[];
  }>;
}

interface RequestBody {
  analysisId: string;
  email: string;
}

interface Analysis {
  id: string;
  problem_statement: string;
  target_audience: string;
  unique_value_proposition: string;
  product_description: string;
  insights: {
    totalScore: number;
    validationStatus: string;
    criticalIssues: Array<{
      issue: string;
      recommendation: string;
    }>;
    nextSteps: Array<{
      title: string;
      description: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    marketOpportunity: {
      score: number;
      insights: Array<{
        title: string;
        description: string;
        actionSteps?: string[];
      }>;
      improvementTips?: string[];
    };
    competitiveAdvantage: {
      score: number;
      insights: Array<{
        title: string;
        description: string;
        actionSteps?: string[];
      }>;
      improvementTips?: string[];
    };
    feasibility: {
      score: number;
      insights: Array<{
        title: string;
        description: string;
        actionSteps?: string[];
      }>;
      improvementTips?: string[];
    };
    revenuePotential: {
      score: number;
      insights: Array<{
        title: string;
        description: string;
        actionSteps?: string[];
      }>;
      improvementTips?: string[];
    };
    marketTiming: {
      score: number;
      insights: Array<{
        title: string;
        description: string;
        actionSteps?: string[];
      }>;
      improvementTips?: string[];
    };
    scalability: {
      score: number;
      insights: Array<{
        title: string;
        description: string;
        actionSteps?: string[];
      }>;
      improvementTips?: string[];
    };
  };
}

/**
 * Utility function to retry failed operations with exponential backoff
 * Useful for handling transient API failures
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
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
Market Opportunity Score: ${analysis.insights.marketOpportunity.score}/100
${analysis.insights.marketOpportunity.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Competitive Advantage Score: ${analysis.insights.competitiveAdvantage.score}/100
${analysis.insights.competitiveAdvantage.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Feasibility Score: ${analysis.insights.feasibility.score}/100
${analysis.insights.feasibility.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Revenue Potential Score: ${analysis.insights.revenuePotential.score}/100
${analysis.insights.revenuePotential.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Market Timing Score: ${analysis.insights.marketTiming.score}/100
${analysis.insights.marketTiming.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Scalability Score: ${analysis.insights.scalability.score}/100
${analysis.insights.scalability.insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Critical Issues Identified:
${analysis.insights.criticalIssues.map(i => `- ${i.issue}: ${i.recommendation}`).join('\n')}

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
      'marketOpportunity': 'marketOpportunity',
      'competitiveAdvantage': 'competitiveAdvantage',
      'feasibility': 'feasibility',
      'revenuePotential': 'revenuePotential',
      'marketTiming': 'marketTiming',
      'scalability': 'scalability'
    };

    const fieldName = categoryToField[category];
    if (!fieldName || !analysis.insights?.[fieldName]) {
      throw new Error(`No insights found for category: ${category}`);
    }

    const categoryData = analysis.insights[fieldName];
    const criticalIssues = analysis.insights.criticalIssues?.filter(issue => 
      issue.issue.toLowerCase().includes(category.toLowerCase()) ||
      issue.recommendation.toLowerCase().includes(category.toLowerCase())
    ) || [];
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt(analysis)
        },
        {
          role: 'user',
          content: generateUserPrompt()
        }
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
                description: 'Score out of 100'
              },
              strengths: {
                type: 'object',
                description: 'Key strengths and positive aspects of the idea',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'Brief summary of what makes this idea strong'
                  },
                  key_points: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Bullet points highlighting specific strengths'
                  }
                },
                required: ['summary', 'key_points']
              },
              opportunities: {
                type: 'object',
                description: 'Key opportunities for improvement and growth',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'Brief summary of the main opportunities'
                  },
                  key_points: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Bullet points highlighting specific opportunities'
                  }
                },
                required: ['summary', 'key_points']
              },
              questions: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Key questions to consider for refining the idea'
              }
            },
            required: ['score', 'strengths', 'opportunities', 'questions']
          }
        }
      ],
      function_call: { name: `analyze_${category.toLowerCase()}` },
      temperature: 0.7
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
): Promise<{ score: number; summary: string; key_strengths: { summary: string; key_points: string[] }; key_opportunities: { summary: string; key_points: string[] }; critical_questions: string[]; business_context: { problem_statement: string; target_audience: string; value_proposition: string; product_description: string } }> {
  // Use the existing total score and data from the insights
  const totalScore = analysis.insights.totalScore;
  const validationStatus = analysis.insights.validationStatus;
  const criticalIssues = analysis.insights.criticalIssues || [];
  const nextSteps = analysis.insights.nextSteps || [];
  
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: generateSystemPrompt(analysis)
      },
      {
        role: 'user',
        content: generateUserPrompt()
      }
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
              description: 'Overall score out of 100'
            },
            validation_status: {
              type: 'string',
              description: 'Current validation status of the idea'
            },
            summary: {
              type: 'string',
              description: 'Brief overview of the business idea and its potential'
            },
            key_strengths: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  description: 'Brief summary of the main strengths across all categories'
                },
                key_points: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Key strengths identified across all categories'
                }
              },
              required: ['summary', 'key_points']
            },
            key_opportunities: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  description: 'Brief summary of the main opportunities across all categories'
                },
                key_points: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Key opportunities identified across all categories'
                }
              },
              required: ['summary', 'key_points']
            },
            critical_questions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Most important questions to address across all categories'
            },
            business_context: {
              type: 'object',
              properties: {
                problem_statement: {
                  type: 'string',
                  description: 'Clear statement of the problem being solved'
                },
                target_audience: {
                  type: 'string',
                  description: 'Description of the target audience'
                },
                value_proposition: {
                  type: 'string',
                  description: 'Unique value proposition'
                },
                product_description: {
                  type: 'string',
                  description: 'Brief description of the product/service'
                }
              },
              required: ['problem_statement', 'target_audience', 'value_proposition', 'product_description']
            }
          },
          required: ['overall_score', 'validation_status', 'summary', 'key_strengths', 'key_opportunities', 'critical_questions', 'business_context']
        }
      }
    ],
    function_call: { name: 'generate_executive_summary' }
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
async function generateCustomerInsights(
  openai: OpenAI,
  analysis: any,
  model: string
) {
  // Get relevant insights from the previous analysis
  const marketData = analysis.insights.marketOpportunity;
  const targetAudienceInsights = marketData.insights.filter((insight: any) => 
    insight.title.toLowerCase().includes('customer') ||
    insight.title.toLowerCase().includes('user') ||
    insight.title.toLowerCase().includes('audience')
  );

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: generateSystemPrompt(analysis)
      },
      {
        role: 'user',
        content: generateUserPrompt()
      }
    ],
    functions: [
      {
        name: 'generate_customer_insights',
        description: 'Generate customer insights and messaging recommendations that build upon existing analysis',
        parameters: {
          type: 'object',
          properties: {
            customerProfile: {
              type: 'object',
              properties: {
                psychologicalProfile: {
                  type: 'string',
                  description: 'Deep psychological understanding of the target customer, incorporating existing market insights'
                },
                painPoints: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Specific pain points identified from market analysis and target audience description'
                },
                desires: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Key desires and aspirations that align with the value proposition'
                },
                transformationStory: {
                  type: 'string',
                  description: 'Narrative of how the product transforms the customer\'s life, based on problem statement and solution'
                }
              },
              required: ['psychologicalProfile', 'painPoints', 'desires', 'transformationStory']
            },
            messaging: {
              type: 'object',
              properties: {
                valueProposition: {
                  type: 'string',
                  description: 'Core value message that resonates with the target audience'
                },
                keyMessages: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Main selling points that highlight unique benefits'
                },
                toneAndVoice: {
                  type: 'string',
                  description: 'Communication style that best connects with the target audience'
                },
                callToAction: {
                  type: 'string',
                  description: 'Primary conversion action that drives user engagement'
                },
                coreBenefits: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Key benefits that resonate with the identified customer profile'
                },
                targetedMessages: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Specific messages crafted for different aspects of the customer profile'
                },
                valueStatements: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Clear value statements that connect pain points to solutions'
                }
              },
              required: ['valueProposition', 'keyMessages', 'toneAndVoice', 'callToAction', 'coreBenefits', 'targetedMessages', 'valueStatements']
            },
            marketingRecommendations: {
              type: 'object',
              properties: {
                channels: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Best marketing channels to reach the target audience'
                },
                contentIdeas: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Content marketing suggestions that align with audience interests'
                },
                engagementStrategies: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'User engagement tactics to build community and loyalty'
                }
              },
              required: ['channels', 'contentIdeas', 'engagementStrategies']
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
                        description: 'Clear hypothesis statement to test'
                      },
                      metric: {
                        type: 'string',
                        description: 'How to measure this hypothesis'
                      },
                      target: {
                        type: 'string',
                        description: 'Target metric that would validate this hypothesis'
                      }
                    },
                    required: ['statement', 'metric', 'target']
                  },
                  description: 'Key hypotheses to validate with the landing page'
                },
                successMetrics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      metric: {
                        type: 'string',
                        description: 'Name of the success metric'
                      },
                      target: {
                        type: 'string',
                        description: 'Target value or range'
                      },
                      rationale: {
                        type: 'string',
                        description: 'Why this metric matters'
                      }
                    },
                    required: ['metric', 'target', 'rationale']
                  },
                  description: 'Key metrics to track for landing page success'
                },
                timeline: {
                  type: 'object',
                  properties: {
                    validationPeriod: {
                      type: 'string',
                      description: 'Recommended timeframe for validation'
                    },
                    milestones: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      description: 'Key milestones in the validation process'
                    }
                  },
                  required: ['validationPeriod', 'milestones']
                }
              },
              required: ['hypotheses', 'successMetrics', 'timeline']
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
                        description: 'Specific action to take'
                      },
                      impact: {
                        type: 'string',
                        description: 'Expected impact of this action'
                      },
                      timeline: {
                        type: 'string',
                        description: 'When this should be done'
                      }
                    },
                    required: ['action', 'impact', 'timeline']
                  },
                  description: 'Immediate next steps to take'
                },
                landingPageChecklist: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Key elements to include in the landing page'
                },
                riskMitigation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      risk: {
                        type: 'string',
                        description: 'Potential risk to address'
                      },
                      mitigation: {
                        type: 'string',
                        description: 'Strategy to mitigate this risk'
                      }
                    },
                    required: ['risk', 'mitigation']
                  },
                  description: 'Strategies to mitigate identified risks'
                }
              },
              required: ['immediate', 'landingPageChecklist', 'riskMitigation']
            }
          },
          required: ['customerProfile', 'messaging', 'marketingRecommendations', 'validationPlan', 'nextSteps']
        }
      }
    ],
    function_call: { name: 'generate_customer_insights' }
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
  const required = [
    'problem_statement',
    'target_audience',
    'unique_value_proposition',
    'product_description'
  ];

  for (const field of required) {
    if (!analysis[field] || typeof analysis[field] !== 'string') {
      throw new Error(`Missing or invalid required field: ${field}`);
    }
  }

  // Check for has_insights boolean flag instead of insights string
  if (analysis.has_insights !== undefined && typeof analysis.has_insights !== 'boolean') {
    throw new Error('Invalid has_insights field: must be a boolean if present');
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
  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4';
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const openai = new OpenAI({ apiKey });

  try {
    console.log('Generating report with OpenAI...');
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt(analysis)
        },
        {
          role: 'user',
          content: generateUserPrompt()
        }
      ],
      functions: [
        {
          name: 'generate_report',
          description: 'Generate a comprehensive business idea analysis report',
          parameters: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              overall_score: { type: 'number' },
              validation_status: { 
                type: 'string',
                enum: ['Ready to Validate', 'Needs Refinement', 'Major Concerns']
              },
              summary: { type: 'string' },
              key_strengths: {
                type: 'object',
                properties: {
                  summary: { type: 'string' },
                  points: { type: 'array', items: { type: 'string' } },
                  potential_impact: { type: 'string' }
                }
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
                      benefits: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  alternative_approaches: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        model: { 
                          type: 'string',
                          enum: ['Subscription', 'One-Time Purchase', 'Freemium']
                        },
                        implementation: { type: 'string' },
                        best_for: { type: 'string' },
                        pricing: { type: 'string' },
                        pros: { type: 'array', items: { type: 'string' } },
                        cons: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  },
                  optimization_opportunities: { 
                    type: 'array',
                    items: { type: 'string' }
                  },
                  early_stage_strategy: {
                    type: 'object',
                    properties: {
                      initial_approach: { type: 'string' },
                      key_metrics: { type: 'array', items: { type: 'string' } },
                      adjustment_triggers: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              },
              refinement_questions: {
                type: 'array',
                items: { type: 'string' }
              },
              challenges: {
                type: 'object',
                properties: {
                  potential_pitfalls: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        challenge: { type: 'string' },
                        context: { type: 'string' }
                      }
                    }
                  },
                  common_gotchas: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        issue: { type: 'string' },
                        prevention: { type: 'string' }
                      }
                    }
                  }
                }
              },
              mitigation_strategies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    challenge: { type: 'string' },
                    actions: { type: 'array', items: { type: 'string' } }
                  }
                }
              },
              recommendation: {
                type: 'object',
                properties: {
                  verdict: { type: 'string' },
                  confidence: { 
                    type: 'string',
                    enum: ['High', 'Medium', 'Low']
                  },
                  rationale: { type: 'string' }
                }
              },
              next_steps: {
                type: 'object',
                properties: {
                  ideal_customers: {
                    type: 'object',
                    properties: {
                      profile: { type: 'string' },
                      channels: { type: 'array', items: { type: 'string' } },
                      influencers: { type: 'array', items: { type: 'string' } },
                      pain_points: { type: 'array', items: { type: 'string' } },
                      approach_strategy: { type: 'string' }
                    }
                  },
                  validation_questions: { type: 'array', items: { type: 'string' } }
                }
              },
              improvement_areas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    area: { type: 'string' },
                    suggestions: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            },
            required: ['overall_score', 'validation_status', 'summary', 'key_strengths', 
                      'monetization', 'refinement_questions', 'challenges', 'mitigation_strategies', 
                      'recommendation']
          }
        }
      ],
      function_call: { name: 'generate_report' }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to get function call response from OpenAI');
    }

    const report = JSON.parse(functionCall.arguments) as Report;
    report.id = nanoid();
    
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
    const { analysisId, email } = await req.json() as RequestBody;

    if (!analysisId) {
      throw new Error('Analysis ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not configured');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the analysis data
    const { data: analysis, error: fetchError } = await supabaseClient
      .from('idea_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      throw new Error(fetchError?.message || 'Analysis not found');
    }

    // Generate the report
    const report = await generateReport(analysis, supabaseClient);

    // Store the report in Supabase
    const { error: insertError } = await supabaseClient
      .from('idea_reports')
      .insert({
        id: report.id,
        analysis_id: analysisId,
        email: email,
        report_data: report,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Failed to store report: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: report
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
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}

serve(handleRequest);
