-- Remove next_steps column from idea_insights table since it's no longer needed
-- Next steps are now only generated in the full report
ALTER TABLE idea_insights DROP COLUMN next_steps;
