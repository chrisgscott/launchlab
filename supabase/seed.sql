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
    '{
        "totalScore": 78,
        "launchStatus": "READY FOR LIFTOFF",
        "marketOpportunity": {
            "score": 85,
            "insights": [
                {
                    "title": "Growing Market",
                    "description": "The meal planning app market is expanding rapidly, with a projected CAGR of 15% over the next 5 years."
                },
                {
                    "title": "Strong Demographics",
                    "description": "Target audience has high disposable income and demonstrated willingness to pay for sustainability solutions."
                }
            ]
        },
        "competitiveAdvantage": {
            "score": 75,
            "insights": [
                {
                    "title": "Unique Value Proposition",
                    "description": "First-to-market with integrated carbon footprint tracking for meal planning."
                },
                {
                    "title": "AI Technology",
                    "description": "Advanced AI algorithms provide personalized recommendations based on preferences and environmental impact."
                }
            ]
        },
        "feasibility": {
            "score": 80,
            "insights": [
                {
                    "title": "Technical Stack",
                    "description": "Core technologies are mature and well-documented with strong community support."
                },
                {
                    "title": "Resource Requirements",
                    "description": "Development timeline and budget are realistic given the scope."
                }
            ]
        },
        "revenuePotential": {
            "score": 70,
            "insights": [
                {
                    "title": "Subscription Model",
                    "description": "Recurring revenue through tiered subscription plans with premium features."
                },
                {
                    "title": "Market Size",
                    "description": "TAM of $5B with realistic path to capturing 2% market share within 3 years."
                }
            ]
        },
        "marketTiming": {
            "score": 85,
            "insights": [
                {
                    "title": "Consumer Trends",
                    "description": "Rising awareness of environmental impact aligns perfectly with product offering."
                },
                {
                    "title": "Market Readiness",
                    "description": "Target audience increasingly adopting digital solutions for meal planning."
                }
            ]
        },
        "scalability": {
            "score": 75,
            "insights": [
                {
                    "title": "Technical Architecture",
                    "description": "Cloud-native design enables rapid scaling with demand."
                },
                {
                    "title": "Market Expansion",
                    "description": "Clear path to expanding into adjacent markets and demographics."
                }
            ]
        },
        "criticalIssues": [
            {
                "issue": "Data Accuracy",
                "recommendation": "Partner with environmental research organizations to validate carbon footprint calculations."
            },
            {
                "issue": "User Retention",
                "recommendation": "Implement gamification and social features to increase engagement."
            }
        ],
        "nextSteps": [
            {
                "title": "Carbon Tracking Validation",
                "description": "Establish partnerships with environmental research organizations.",
                "priority": "HIGH"
            },
            {
                "title": "Beta Testing Program",
                "description": "Launch closed beta with 100 target users.",
                "priority": "MEDIUM"
            },
            {
                "title": "Marketing Strategy",
                "description": "Develop content marketing plan focused on sustainability.",
                "priority": "LOW"
            }
        ]
    }'::jsonb
);
