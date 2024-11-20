-- Add report_url and report_email columns to idea_analyses
ALTER TABLE idea_analyses
ADD COLUMN report_url text,
ADD COLUMN report_email text;

-- Drop the report_access table and function since we're not using tokens anymore
DROP TABLE IF EXISTS report_access CASCADE;
DROP FUNCTION IF EXISTS create_report_access_token CASCADE;

-- Add a unique constraint on report_url to ensure no duplicates
ALTER TABLE idea_analyses
ADD CONSTRAINT unique_report_url UNIQUE (report_url);
