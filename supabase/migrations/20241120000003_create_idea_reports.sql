-- Create idea_reports table
CREATE TABLE IF NOT EXISTS idea_reports (
    id TEXT PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES idea_analyses(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_idea_reports_analysis_id ON idea_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_idea_reports_email ON idea_reports(email);
CREATE INDEX IF NOT EXISTS idx_idea_reports_created_at ON idea_reports(created_at);

-- Add RLS policies
ALTER TABLE idea_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own reports
CREATE POLICY "Users can read their own reports"
    ON idea_reports
    FOR SELECT
    TO authenticated
    USING (
        email = auth.jwt()->>'email'
    );

-- Allow the service role to read and write all reports
CREATE POLICY "Service role has full access to reports"
    ON idea_reports
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_idea_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER update_idea_reports_updated_at
    BEFORE UPDATE ON idea_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_idea_reports_updated_at();

-- Add a trigger to notify about new reports
CREATE OR REPLACE FUNCTION notify_report_created()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'new_report',
        json_build_object(
            'id', NEW.id,
            'analysis_id', NEW.analysis_id,
            'email', NEW.email,
            'created_at', NEW.created_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER report_created_notify
    AFTER INSERT ON idea_reports
    FOR EACH ROW
    EXECUTE FUNCTION notify_report_created();

-- Create a view for report summaries
CREATE OR REPLACE VIEW report_summaries AS
SELECT 
    r.id,
    r.analysis_id,
    r.email,
    r.created_at,
    r.report_data->>'validation_status' as validation_status,
    r.report_data->>'overall_score' as overall_score,
    r.report_data->>'summary' as summary
FROM idea_reports r;

-- Grant access to the view
GRANT SELECT ON report_summaries TO authenticated;
