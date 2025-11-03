-- Migration script to drop the final_etr column from tasks table
-- Run this in your Supabase SQL Editor to remove the unused final_etr column

-- Drop final_etr column if it exists
ALTER TABLE tasks DROP COLUMN IF EXISTS final_etr;

-- Verify the column has been dropped
-- This query should return 0 if the column doesn't exist
SELECT COUNT(*) as column_exists
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name = 'final_etr';

