-- One-time migration script to backfill completed_at for existing completed tasks
-- Run this in your Supabase SQL Editor to set completion dates for old completed tasks

-- Backfill completed_at for all tasks that are marked as done
-- completed_at is set to updated_at (best approximation) or current date if updated_at is null
-- This will show completion date in the ETR column instead of days remaining
UPDATE tasks 
SET completed_at = COALESCE(updated_at::date, CURRENT_DATE)
WHERE done = TRUE 
  AND completed_at IS NULL;

-- Verify the update
-- This query shows how many tasks were updated
SELECT 
  COUNT(*) as updated_tasks,
  COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as with_completion_date
FROM tasks 
WHERE done = TRUE 
  AND completed_at IS NOT NULL;

