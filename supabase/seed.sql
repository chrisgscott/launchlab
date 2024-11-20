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

-- Create report_access table
create table if not exists public.report_access (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  token text not null unique,
  email text not null,
  expires_at timestamp with time zone not null
);

-- Add analysis_id column to report_access table
alter table public.report_access
add column if not exists analysis_id uuid references public.idea_analyses(id);

-- Set up RLS policies for report_access
alter table public.report_access enable row level security;

create policy "Enable read access for authenticated users" on public.report_access
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for all users" on public.report_access
  for insert with check (true);
