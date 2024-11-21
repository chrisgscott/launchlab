-- Remove old report-related columns from idea_analyses
ALTER TABLE idea_analyses
    DROP COLUMN IF EXISTS report_data,
    DROP COLUMN IF EXISTS report_generated,
    DROP COLUMN IF EXISTS report_generated_at,
    DROP COLUMN IF EXISTS report_email,
    DROP COLUMN IF EXISTS report_url;
