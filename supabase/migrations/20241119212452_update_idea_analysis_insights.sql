-- Update idea_analyses table to use new insights structure
ALTER TABLE idea_analyses
ADD COLUMN IF NOT EXISTS temp_insights jsonb;

-- Migrate existing data to new structure
UPDATE idea_analyses
SET temp_insights = jsonb_build_object(
  'oneLiner', '',
  'uniqueValueInsights', ARRAY[]::text[],
  'differentiators', ARRAY[]::text[],
  'targetAudienceInsights', ARRAY[]::text[],
  'painPoints', ARRAY[]::text[],
  'headlines', ARRAY[]::text[],
  'keyBenefits', ARRAY[]::text[],
  'nextSteps', ARRAY[]::text[],
  'successMetrics', ARRAY[]::text[],
  'successStories', ARRAY[]::text[],
  'totalScore', COALESCE((insights->>'totalScore')::numeric, 0),
  'marketOpportunities', ARRAY[]::text[],
  'risks', ARRAY[]::text[],
  'launchStatus', insights->>'launchStatus',
  'criticalIssues', '[]'::jsonb,
  'nextStepsReport', '[]'::jsonb
)
WHERE insights IS NOT NULL;

-- Replace old insights with new structure
UPDATE idea_analyses
SET insights = temp_insights
WHERE temp_insights IS NOT NULL;

-- Clean up
ALTER TABLE idea_analyses
DROP COLUMN IF EXISTS temp_insights;