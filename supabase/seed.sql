-- Seed data for idea_analyses
insert into idea_analyses (
    problem_statement,
    target_audience,
    unique_value_proposition,
    product_description,
    insights
) values (
    'Working parents struggle to plan and prepare healthy, sustainable meals for their families while managing food waste and environmental impact.',
    'Environmentally conscious working parents, aged 30-45, with household incomes above $75,000.',
    'EcoMeal is the first meal planning app that combines AI-powered recipe suggestions with real-time carbon footprint tracking.',
    'AI-powered weekly meal plans with smart shopping lists and carbon footprint tracking.',
    jsonb_build_object(
        'summary', jsonb_build_object(
            'oneLiner', 'EcoMeal helps working parents plan sustainable meals and reduce food waste.',
            'overview', 'An AI-powered meal planning app that combines sustainability tracking with practical meal solutions for busy families.',
            'problemStatement', 'Working parents struggle with meal planning while wanting to minimize environmental impact.',
            'targetMarket', 'Environmentally conscious working parents with disposable income'
        ),
        'marketAnalysis', jsonb_build_object(
            'marketSize', 'Large and growing market of eco-conscious consumers',
            'competitiveLandscape', 'Few direct competitors in the sustainable meal planning space',
            'keyDifferentiators', array['Real-time carbon footprint tracking', 'AI-powered personalization', 'Focus on sustainability'],
            'marketTrends', array['Growing interest in sustainable living', 'Increasing adoption of meal planning apps', 'Rising awareness of food waste impact']
        ),
        'valueProposition', jsonb_build_object(
            'keyBenefits', array['Save time on meal planning', 'Reduce environmental impact', 'Minimize food waste'],
            'uniqueFeatures', array['First meal planning app with carbon footprint tracking', 'AI-powered recipe suggestions', 'Smart shopping lists'],
            'customerPainPoints', array['Limited time for meal planning', 'Concern about environmental impact', 'Food waste management']
        ),
        'validationStatus', 'READY TO VALIDATE',
        'validationDetails', jsonb_build_object(
            'nextSteps', array['Validate carbon footprint calculations', 'Build recipe database', 'Test with target users'],
            'keyMetrics', array['User retention rate', 'Carbon footprint reduction', 'Food waste reduction'],
            'criticalQuestions', array['How accurate are the carbon footprint calculations?', 'What is the minimum viable recipe database size?', 'How will we validate recipe suggestions?']
        ),
        'marketOpportunity', jsonb_build_object(
            'size', 'Large and growing',
            'growth', 'High',
            'barriers', array['Data accuracy', 'Recipe database', 'User adoption']
        ),
        'competitiveAdvantage', jsonb_build_object(
            'uniqueFeatures', array['Carbon tracking', 'AI personalization'],
            'barriers', array['First mover advantage', 'Data partnerships']
        ),
        'feasibility', jsonb_build_object(
            'technical', 'High',
            'operational', 'Medium',
            'challenges', array['Data accuracy', 'Recipe sourcing']
        ),
        'revenuePotential', jsonb_build_object(
            'model', 'Freemium',
            'streams', array['Premium subscriptions', 'Partner integrations'],
            'projections', 'High potential with proven willingness to pay'
        ),
        'marketTiming', jsonb_build_object(
            'readiness', 'High',
            'trends', array['Sustainability focus', 'Digital solutions adoption']
        ),
        'scalability', jsonb_build_object(
            'potential', 'High',
            'requirements', array['Recipe database', 'Carbon data'],
            'challenges', array['Data accuracy', 'User retention']
        ),
        'totalScore', 78,
        'criticalIssues', '[]'::jsonb,
        'nextSteps', array['Validate carbon footprint calculations', 'Build recipe database', 'Test with target users'],
        'riskAssessment', jsonb_build_object(
            'technicalRisks', array['Data accuracy for carbon footprint', 'Recipe database maintenance'],
            'marketRisks', array['User engagement retention', 'Competition from established meal planning apps'],
            'mitigationStrategies', array['Partner with environmental research institutions', 'Implement regular data validation', 'Focus on user engagement and retention']
        )
    )
);

-- Add a sample idea report
insert into idea_reports (
    id,
    analysis_id,
    email,
    report_data,
    created_at
) values (
    'sample-report-id',
    (select id from idea_analyses limit 1),
    'test@example.com',
    jsonb_build_object(
        'overall_score', 78,
        'validation_status', 'Ready to Validate',
        'summary', 'EcoMeal shows strong potential in the growing sustainable meal planning market.',
        'key_strengths', jsonb_build_object(
            'summary', 'Strong market opportunity with clear competitive advantages',
            'points', array[
                'First-to-market with carbon footprint tracking',
                'AI-powered personalization',
                'Target audience has proven willingness to pay'
            ],
            'potential_impact', 'Could significantly reduce household food waste while making sustainable eating more accessible'
        ),
        'monetization', jsonb_build_object(
            'primary_stream', jsonb_build_object(
                'approach', 'Freemium Subscription',
                'rationale', 'Allows users to try basic features while monetizing power users',
                'pricing', '$9.99/month for premium features',
                'benefits', array[
                    'Predictable recurring revenue',
                    'Lower barrier to entry',
                    'Upsell opportunities'
                ]
            ),
            'alternative_approaches', '[]'::jsonb,
            'optimization_opportunities', '[]'::jsonb,
            'early_stage_strategy', jsonb_build_object(
                'initial_approach', 'Focus on growing user base with free tier',
                'key_metrics', array['User retention', 'Premium conversion rate'],
                'adjustment_triggers', array['Low retention', 'High churn']
            )
        ),
        'refinement_questions', array[
            'How will you source accurate carbon footprint data?',
            'What integration partnerships might be needed?',
            'How will you validate recipe suggestions?'
        ],
        'challenges', jsonb_build_object(
            'potential_pitfalls', array[
                jsonb_build_object(
                    'challenge', 'Data accuracy',
                    'context', 'Carbon footprint calculations must be reliable'
                )
            ],
            'common_gotchas', array[
                jsonb_build_object(
                    'issue', 'Recipe complexity',
                    'prevention', 'Start with simple, proven recipes'
                )
            ]
        ),
        'mitigation_strategies', array[
            jsonb_build_object(
                'challenge', 'Data accuracy',
                'actions', array[
                    'Partner with environmental research institutions',
                    'Implement regular data validation'
                ]
            )
        ],
        'recommendation', jsonb_build_object(
            'verdict', 'Proceed with validation',
            'confidence', 'High',
            'rationale', 'Strong market opportunity with clear differentiation'
        )
    ),
    now()
);
