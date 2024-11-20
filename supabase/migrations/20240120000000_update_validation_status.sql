-- Update the validation status enum type
DO $$ BEGIN
    -- Drop the old enum type if it exists (cascade will handle dependent columns)
    DROP TYPE IF EXISTS launch_status CASCADE;
    
    -- Create the new enum type
    CREATE TYPE validation_status AS ENUM (
        'READY TO VALIDATE',
        'NEEDS REFINEMENT',
        'MAJOR CONCERNS'
    );
END $$;

-- Add a CHECK constraint to ensure the status is valid
ALTER TABLE idea_analyses DROP CONSTRAINT IF EXISTS idea_analyses_validation_status_check;
ALTER TABLE idea_analyses
ADD CONSTRAINT idea_analyses_validation_status_check
CHECK (
    REPLACE(REPLACE(insights->>'validationStatus', '"', ''), '''', '') IN (
        'READY TO VALIDATE',
        'NEEDS REFINEMENT',
        'MAJOR CONCERNS'
    )
);

-- Update existing records to use the new status values
UPDATE idea_analyses
SET insights = jsonb_set(
    insights - 'launchStatus',
    '{validationStatus}',
    CASE 
        WHEN insights->>'launchStatus' = 'READY FOR LIFTOFF' THEN '"READY TO VALIDATE"'
        WHEN insights->>'launchStatus' = 'PREFLIGHT CHECKS NEEDED' THEN '"NEEDS REFINEMENT"'
        WHEN insights->>'launchStatus' = 'MISSION SCRUBBED' THEN '"MAJOR CONCERNS"'
        ELSE '"NEEDS REFINEMENT"'
    END::jsonb
)
WHERE insights ? 'launchStatus';
