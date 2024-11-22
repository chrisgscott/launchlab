-- Seed data for idea_insights table
-- This represents our initial example of a validated idea for LaunchLab itself
INSERT INTO "public"."idea_insights" (
    "id",
    "user_id",
    "idea_name",
    "problem_statement",
    "target_audience",
    "unique_value_proposition",
    "product_description",
    "total_score",
    "validation_status",
    "market_opportunity",
    "competitive_advantage",
    "feasibility",
    "revenue_potential",
    "market_timing",
    "scalability",
    "critical_issues",
    "created_at",
    "updated_at"
) VALUES (
    '68006627-c9ec-4bf8-8c21-965338e1e9a1',  -- Fixed UUID for reproducibility
    null,  -- No user_id as this is example data
    'LaunchLab - AI-Powered Idea Validation Platform',
    'Entrepreneurs waste thousands of dollars and months of effort building products that no one wants. Traditional market research is expensive and time-consuming, while existing validation tools are fragmented and unreliable. This leads to a 90% startup failure rate, with 42% failing due to no market need.',
    'Dreamers and innovators from all walks of life who have ideas worth fighting for. From single parents with side-hustle dreams to small-town innovators, recent graduates with fresh perspectives to career-switchers who see problems nobody else is solving. Our platform serves those who have the courage to innovate, regardless of their background, resources, or location.',
    'LaunchLab democratizes innovation by turning the complex journey of idea validation into a clear, supportive path anyone can follow. Our AI-powered platform provides honest insights, practical validation tools, and community support - helping you test your idea''s potential in days, not months, without risking everything. Because we believe great ideas can come from anywhere and they deserve a fighting chance.',
    'LaunchLab is a supportive platform that guides entrepreneurs from initial idea to validated concept, regardless of their starting point. Our AI-powered system provides:
Honest, judgment-free analysis of your idea''s potential
Clear, actionable steps to validate your concept
Landing page builder to attract and engage with early supporters
Pre-launch monetization tools to test market demand and generate pre-launch revenue
Community support from fellow innovators
We''ve stripped away the jargon, complexity, and gatekeeping that typically block great ideas from becoming reality. Whether you''re sketching ideas during lunch breaks or building after hours, LaunchLab provides the insights, tools, and support you need to validate your concept without risking everything. No technical expertise required - just bring your idea and determination',
    79,  -- Integer total_score
    'READY TO VALIDATE',
    '{"score": 85, "insights": [{"title": "Real Problem with a Large Audience", "description": "The high startup failure rate indicates a substantial market need for effective idea validation tools."}, {"title": "Growth Potential", "description": "With the rise of entrepreneurship and remote work, more people are looking for ways to validate ideas efficiently."}, {"title": "Active Demand", "description": "The increasing reliance on digital solutions for market research shows a readiness for platforms like LaunchLab."}], "improvement_tips": ["Survey potential users to refine their specific validation pain points.", "Research competitors to identify gaps in existing offerings.", "Create a minimum viable product (MVP) to test demand quickly."]}',
    '{"score": 80, "insights": [{"title": "Democratizing Innovation", "description": "The platform''s focus on accessibility differentiates it in a crowded market."}, {"title": "AI-Driven Insights", "description": "Using AI for personalized validation can provide a competitive edge over traditional methods."}, {"title": "Community Support", "description": "Building a community around idea validation fosters user engagement and loyalty."}], "improvement_tips": ["Clearly communicate your unique AI capabilities compared to competitors.", "Develop partnerships with entrepreneurial organizations for credibility.", "Create case studies showcasing successful validation stories."]}',
    '{"score": 75, "insights": [{"title": "Current Tech Capabilities", "description": "AI technology for analysis and landing page creation is available and feasible."}, {"title": "Resource Requirements", "description": "A skilled team for AI development and community management is essential."}, {"title": "Time to Launch", "description": "With a focused MVP, the platform can be launched within a few months."}], "improvement_tips": ["Outline a clear tech stack and development timeline for the MVP.", "Identify key team members or advisors to help build the platform.", "Consider a phased rollout, starting with core features."]}',
    '{"score": 70, "insights": [{"title": "Clear Revenue Models", "description": "Subscription fees, premium features, and monetization tools offer multiple income streams."}, {"title": "User Willingness to Pay", "description": "Entrepreneurs often invest in tools that save them time and money."}, {"title": "Sustainability", "description": "Recurring revenue from subscriptions can provide a stable financial base."}], "improvement_tips": ["Test pricing strategies with potential users to gauge willingness to pay.", "Explore affiliate partnerships with related services for additional revenue.", "Develop a freemium model to attract users initially."]}',
    '{"score": 90, "insights": [{"title": "Entrepreneurial Surge", "description": "The pandemic has accelerated interest in entrepreneurship and side hustles."}, {"title": "Technological Readiness", "description": "Users are increasingly comfortable using digital platforms for business solutions."}, {"title": "Shifts in Market Needs", "description": "The demand for low-cost, rapid validation tools is growing."}], "improvement_tips": ["Monitor emerging trends in entrepreneurship and tech for ongoing relevance.", "Engage with your target audience on social media to gather insights.", "Leverage current events to position your platform as a timely solution."]}',
    '{"score": 80, "insights": [{"title": "Growth Potential", "description": "The platform can scale with increasing user demand and feature expansion."}, {"title": "Operational Complexity", "description": "Community management and continuous AI improvement will be vital as you grow."}, {"title": "Realistic Growth Path", "description": "If executed well, the platform can capture a significant share of the market."}], "improvement_tips": ["Plan for user support and community management as your user base grows.", "Invest in scalable technology solutions from the start.", "Develop a roadmap for future feature expansions based on user feedback."]}',
    '{}',  -- Empty JSON object for critical_issues
    NOW(),  -- Current timestamp for created_at
    NOW()   -- Current timestamp for updated_at
);
