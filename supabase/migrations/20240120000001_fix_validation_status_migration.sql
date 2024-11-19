-- Fix the validation status migration
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

-- Verify no records still have the old status
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM idea_analyses 
        WHERE insights ? 'launchStatus'
    ) THEN 
        RAISE EXCEPTION 'Migration failed: Some records still have launchStatus';
    END IF;
    
    IF EXISTS (
        SELECT 1 
        FROM idea_analyses 
        WHERE insights ? 'validationStatus' 
        AND NOT (insights->>'validationStatus' = ANY (
            ARRAY['READY TO VALIDATE', 'NEEDS REFINEMENT', 'MAJOR CONCERNS']
        ))
    ) THEN 
        RAISE EXCEPTION 'Migration failed: Invalid validationStatus values found';
    END IF;
END $$;
