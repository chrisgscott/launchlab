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
ALTER TABLE idea_analyses
ADD CONSTRAINT idea_analyses_validation_status_check
CHECK (
    (insights->>'validationStatus')::text IN (
        'READY TO VALIDATE',
        'NEEDS REFINEMENT',
        'MAJOR CONCERNS'
    )
);

-- Update existing records to use the new status values
UPDATE idea_analyses
SET insights = jsonb_set(
    insights,
    '{validationStatus}',
    CASE 
        WHEN insights->>'launchStatus' = 'READY FOR LIFTOFF' THEN '"READY TO VALIDATE"'
        WHEN insights->>'launchStatus' = 'PREFLIGHT CHECKS NEEDED' THEN '"NEEDS REFINEMENT"'
        WHEN insights->>'launchStatus' = 'MISSION SCRUBBED' THEN '"MAJOR CONCERNS"'
        ELSE '"NEEDS REFINEMENT"'
    END::jsonb
)
WHERE insights ? 'launchStatus';

-- Remove the old launchStatus field from the insights JSONB
UPDATE idea_analyses
SET insights = insights - 'launchStatus'
WHERE insights ? 'launchStatus';
