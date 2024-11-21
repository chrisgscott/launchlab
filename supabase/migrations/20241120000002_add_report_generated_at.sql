-- Add report_generated_at column to idea_analyses table
ALTER TABLE idea_analyses
ADD COLUMN report_generated_at TIMESTAMP WITH TIME ZONE;

-- Add comment for clarity
COMMENT ON COLUMN idea_analyses.report_generated_at IS 'Timestamp when the report was generated';
