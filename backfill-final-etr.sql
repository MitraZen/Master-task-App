-- One-time migration script to backfill final_etr for existing completed tasks
-- Run this in your Supabase SQL Editor to fix old completed tasks showing dynamic ETR

-- Backfill final_etr for all tasks that are marked as done but don't have final_etr set
-- This will freeze the ETR at the current calculated value (even if negative)
UPDATE tasks 
SET final_etr = (due_date::date - CURRENT_DATE)::integer
WHERE done = TRUE 
  AND final_etr IS NULL
  AND due_date IS NOT NULL;

-- Verify the update
-- This query shows how many tasks were updated
SELECT 
  COUNT(*) as updated_tasks,
  COUNT(CASE WHEN final_etr < 0 THEN 1 END) as negative_etr,
  COUNT(CASE WHEN final_etr >= 0 THEN 1 END) as positive_etr
FROM tasks 
WHERE done = TRUE 
  AND final_etr IS NOT NULL;

