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
        "validationStatus": "\"READY TO VALIDATE\"",
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

-- Add report_data and report_generated columns to idea_analyses
alter table public.idea_analyses
add column if not exists report_data jsonb,
add column if not exists report_generated boolean default false;

-- Add report_url and report_email columns to idea_analyses
alter table public.idea_analyses
add column if not exists report_url text,
add column if not exists report_email text;

-- Add analysis_id column to idea_analyses
alter table public.idea_analyses
add column if not exists analysis_id uuid references public.idea_analyses(id);

-- Insert example analysis with report data
INSERT INTO "public"."idea_analyses" (
    "id",
    "created_at",
    "updated_at",
    "problem_statement",
    "target_audience",
    "unique_value_proposition",
    "product_description",
    "insights",
    "user_id",
    "report_generated",
    "report_data",
    "report_url",
    "report_email"
) VALUES (
    'dae14842-dc6a-43a2-9880-a1d1ee3d37c1',
    '2024-11-20 01:06:07.719152+00',
    '2024-11-20 01:08:42.087051+00',
    'Aspiring entrepreneurs waste significant time and money building products without validating market demand, leading to a 90% failure rate. Currently, entrepreneurs must cobble together multiple expensive tools and services for market research, landing pages, and pre-sales, costing $1000+ and taking weeks to set up. This high barrier prevents many innovative ideas from being properly tested before major investments are made.',
    'Early-stage entrepreneurs and innovators with product ideas, particularly those familiar with no-code and AI tools. They typically have full-time jobs (25-45 years old), limited time and budgets ($500-5000 for validation), and are tech-savvy but want to minimize risk before committing significant resources. They''re frustrated with the complex, expensive process of validating business ideas and want a more streamlined, data-driven approach.',
    'UseLaunchLab reduces the risk of startup failure through an all-in-one platform that helps validate ideas in a fraction of the time and the cost of traditional methods. Our AI-powered platform combines idea validation, landing pages, lead list building features, and pre-sales capabilities with a built-in network of early adopters, giving entrepreneurs everything they need to test market demand before making major investments.',
    'UseLaunchLab reduces the risk of startup failure through an all-in-one platform that helps validate ideas in a fraction of the time and the cost of traditional methods. Our AI-powered platform combines idea validation, landing pages, lead list building features, and pre-sales capabilities with a built-in network of early adopters, giving entrepreneurs everything they need to test market demand before making major investments.',
    '{"nextSteps": [{"title": "Develop MVP", "priority": "HIGH", "description": "Focus on creating a minimum viable product that includes the core features for idea validation and lead generation."}, {"title": "Conduct Market Research", "priority": "HIGH", "description": "Engage potential users to validate pricing and features, ensuring alignment with their needs."}, {"title": "Establish Marketing Strategy", "priority": "MEDIUM", "description": "Plan how to reach your target audience effectively, emphasizing the unique benefits of your platform."}], "totalScore": 72, "feasibility": {"score": 70, "insights": [{"title": "Technology Viability", "description": "The technology to create this platform exists, but integrating all features seamlessly will be a challenge."}, {"title": "Resource Requirements", "description": "You''ll need a solid development team and possibly partnerships with data providers for market insights."}, {"title": "Timeline Considerations", "description": "Depending on your team''s experience, it could take 6-12 months to launch a minimum viable product (MVP)."}]}, "scalability": {"score": 60, "insights": [{"title": "Growth Potential", "description": "The platform can scale as more entrepreneurs join, but operational challenges may arise."}, {"title": "Bottleneck Risks", "description": "Customer support and platform maintenance will be critical as user numbers grow."}, {"title": "Realistic Growth Path", "description": "Consider how you''ll manage increased demand and ensure quality of service as you scale."}]}, "marketTiming": {"score": 85, "insights": [{"title": "Current Trends", "description": "The rise of no-code tools and AI makes this the perfect time to launch a streamlined validation platform."}, {"title": "User Readiness", "description": "Early-stage entrepreneurs are more tech-savvy and willing to embrace new tools for efficiency."}, {"title": "Market Dynamics", "description": "With the growing number of startups, there''s a strong trend towards minimizing failure through better validation."}]}, "criticalIssues": [], "revenuePotential": {"score": 65, "insights": [{"title": "Pricing Strategy", "description": "There''s potential for a subscription model, but you''ll need to ensure pricing aligns with what your target audience can afford."}, {"title": "Sustainable Revenue Model", "description": "Consider various revenue streams (e.g., tiered subscriptions, premium features) to enhance sustainability."}, {"title": "Market Willingness to Pay", "description": "Ensure you conduct surveys or interviews to validate that your target audience will pay for this service."}]}, "validationStatus": "READY TO VALIDATE", "marketOpportunity": {"score": 80, "insights": [{"title": "Real Problem Addressed", "description": "You''re targeting a significant pain point for early-stage entrepreneurs, which is a strong start. Many struggle with high costs and complexity in validating their ideas."}, {"title": "Large Target Market", "description": "The market of aspiring entrepreneurs is sizable and growing, especially with the rise of no-code tools and the gig economy."}, {"title": "Active Demand", "description": "Entrepreneurs are actively seeking solutions to validate their ideas more efficiently, indicating a good market fit."}]}, "competitiveAdvantage": {"score": 75, "insights": [{"title": "Unique Offering", "description": "The all-in-one platform is a great differentiator, especially with AI integration which can enhance the user experience."}, {"title": "Network of Early Adopters", "description": "Having a built-in network to connect entrepreneurs with potential customers adds significant value."}, {"title": "Potential Copycats", "description": "While the idea is strong, the risk of competitors emerging is high, so continuous innovation is necessary."}]}}',
    null,
    true,
    '"# Validation Roadmap Report for UseLaunchLab\n\n## 1. Executive Summary\nUseLaunchLab aims to transform the entrepreneurial landscape by providing an all-in-one platform that dramatically reduces the time and cost associated with validating business ideas. Given the alarming 90% failure rate of startups, this platform provides aspiring entrepreneurs with essential tools for market research, landing page creation, lead generation, and pre-sales—all integrated and accessible at a fraction of the traditional costs. With a target audience of tech-savvy, early-stage entrepreneurs, UseLaunchLab addresses their need for a streamlined, cost-effective solution to validate ideas before committing significant resources.\n\n## 2. Market Analysis and Opportunity\nThe startup ecosystem is characterized by high failure rates, largely due to inadequate market validation. The target audience—early-stage entrepreneurs aged 25-45—faces the dual challenge of limited time and budget. Current solutions are fragmented, expensive, and time-consuming.\n\n### Market Opportunity:\n- **Size**: An estimated 100 million aspiring entrepreneurs globally.\n- **Growth Rate**: The entrepreneurial sector is growing at an annual rate of 15%, especially in tech-related ventures.\n- **Market Gap**: Lack of accessible, affordable validation tools for early-stage entrepreneurs.\n\n## 3. Key Strengths and Competitive Advantages\n- **All-in-One Solution**: Unlike existing fragmented tools, UseLaunchLab integrates multiple functionalities into a single platform.\n- **AI-Powered Insights**: The platform leverages AI to provide data-driven recommendations, enhancing decision-making.\n- **Cost Efficiency**: Aimed at reducing validation costs to under $500, making it accessible for entrepreneurs with limited budgets.\n- **Early Adopter Network**: Built-in access to a network of early adopters facilitates quicker feedback and validation.\n\n## 4. Critical Issues and Challenges\n- **Market Penetration**: Building brand awareness in a crowded market.\n- **User Experience**: Ensuring the platform is intuitive and user-friendly for those who may not be familiar with advanced tech tools.\n- **Trust and Credibility**: Establishing trust with users who may be skeptical of new platforms after previous failures with existing tools.\n- **Technical Development**: Ensuring the platform''s features are robust and deliver on the promised functionality.\n\n## 5. Recommended Next Steps\n1. **Market Research and User Interviews**: Conduct detailed interviews with the target audience to refine the product features and gather essential feedback.\n2. **Prototype Development**: Build a minimum viable product (MVP) that includes core functionalities, such as landing pages and lead generation.\n3. **Pilot Testing**: Engage a select group of entrepreneurs in a beta test to gather real-world usage data and insights for further refinement.\n4. **Marketing Strategy**: Develop a comprehensive marketing plan targeting online communities, startup incubators, and social media platforms frequented by early-stage entrepreneurs.\n5. **Partnership Development**: Establish partnerships with startup incubators and co-working spaces to promote the platform and provide additional credibility.\n\n## 6. Timeline and Milestones\n- **Months 1-2**: Conduct market research and user interviews; finalize product features based on feedback.\n- **Months 3-4**: Develop and launch the MVP; initiate pilot testing with early adopters.\n- **Months 5-6**: Analyze pilot data, refine the platform, and develop marketing strategies.\n- **Months 7-9**: Launch the platform publicly; begin outreach and partnerships.\n- **Months 10-12**: Evaluate initial performance and user feedback; iterate on product and marketing based on data.\n\n## 7. Success Metrics and KPIs\n- **User Acquisition**: Target 500 users within the first 6 months post-launch.\n- **User Engagement**: Aim for a 70% engagement rate with platform features during the first year.\n- **Customer Satisfaction**: Achieve a Net Promoter Score (NPS) of 40 or higher.\n- **Revenue Generation**: Generate at least $100,000 in revenue within the first 12 months after launch.\n- **Validation Success Rate**: Track the percentage of users who successfully validate their ideas through the platform, aiming for a 60% success rate.\n\n---\n\nThis validation roadmap report serves as a comprehensive guide for UseLaunchLab to effectively navigate the entrepreneurial landscape, ensuring that the platform not only meets the needs of its target audience but also achieves sustainable growth and success."',
    'example-secure-url',
    'test@example.com'
);
