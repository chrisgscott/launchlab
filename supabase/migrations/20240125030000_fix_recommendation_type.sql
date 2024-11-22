-- Change recommendation column from JSONB array to single JSONB object
-- This better matches the OpenAI response format and the intended use case
-- of having a single high-level strategic recommendation

-- First, drop the existing column
ALTER TABLE idea_reports DROP COLUMN recommendation;

-- Then add it back as a single JSONB object
ALTER TABLE idea_reports ADD COLUMN recommendation JSONB NOT NULL DEFAULT '{}'::jsonb;
