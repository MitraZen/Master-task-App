-- One-time migration script to backfill final_etr and completed_at for existing completed tasks
-- Run this in your Supabase SQL Editor to fix old completed tasks showing dynamic ETR

-- Backfill final_etr and completed_at for all tasks that are marked as done
-- completed_at is set to updated_at (best approximation) or current date if updated_at is null
-- This will freeze the ETR and show completion date instead of days remaining
UPDATE tasks 
SET 
  final_etr = (due_date::date - CURRENT_DATE)::integer,
  completed_at = COALESCE(updated_at::date, CURRENT_DATE)
WHERE done = TRUE 
  AND (final_etr IS NULL OR completed_at IS NULL)
  AND due_date IS NOT NULL;

-- Verify the update
-- This query shows how many tasks were updated
SELECT 
  COUNT(*) as updated_tasks,
  COUNT(CASE WHEN final_etr < 0 THEN 1 END) as negative_etr,
  COUNT(CASE WHEN final_etr >= 0 THEN 1 END) as positive_etr,
  COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as with_completion_date
FROM tasks 
WHERE done = TRUE 
  AND final_etr IS NOT NULL;

