-- Add check constraint to ensure insights follows our new schema structure
alter table idea_analyses add constraint insights_structure_check check (
  jsonb_typeof(insights) = 'object' and
  insights ? 'marketOpportunity' and
  insights ? 'competitiveAdvantage' and
  insights ? 'feasibility' and
  insights ? 'revenuePotential' and
  insights ? 'marketTiming' and
  insights ? 'scalability' and
  insights ? 'totalScore' and
  insights ? 'validationStatus' and
  insights ? 'criticalIssues' and
  insights ? 'nextSteps'
);

-- Add an index on totalScore for potential sorting/filtering
create index idx_idea_analyses_total_score on idea_analyses ((insights->>'totalScore'));

-- Add an index on launchStatus for filtering
create index idx_idea_analyses_launch_status on idea_analyses ((insights->>'launchStatus'));

-- Add a comment explaining the insights structure
comment on column idea_analyses.insights is 'Structured analysis of the business idea including scores, insights, and recommendations. See types/supabase.ts for the full TypeScript type definition.';
