-- Script to fix tasks that are incorrectly marked as archived
-- Rule: Only tasks where done = true should have archived_at set
-- All other tasks should have archived_at = NULL and is_archived = false
-- Run this in your Supabase SQL Editor

-- Check for incorrectly archived tasks:
-- 1. Tasks with archived_at but done = false (shouldn't be archived)
-- 2. Tasks with is_archived = true but done = false (shouldn't be archived)
SELECT 
  COUNT(*) FILTER (WHERE done = false AND archived_at IS NOT NULL) as not_done_with_archived_at,
  COUNT(*) FILTER (WHERE done = false AND is_archived = true) as not_done_but_archived,
  COUNT(*) FILTER (WHERE done = true AND archived_at IS NOT NULL) as done_with_archived_at,
  COUNT(*) FILTER (WHERE done = true AND is_archived = true) as done_and_archived
FROM tasks;

-- Fix 1: Unarchive tasks that are not done but have archived_at set
UPDATE tasks 
SET 
  is_archived = false,
  archived_at = NULL
WHERE done = false 
  AND archived_at IS NOT NULL;

-- Fix 2: Unarchive tasks that are not done but have is_archived = true
UPDATE tasks 
SET 
  is_archived = false,
  archived_at = NULL
WHERE done = false 
  AND is_archived = true;

-- Verify the fix - these should return 0
SELECT 
  COUNT(*) as remaining_not_done_with_archived_at
FROM tasks 
WHERE done = false 
  AND (archived_at IS NOT NULL OR is_archived = true);

-- Show final summary
SELECT 
  COUNT(*) FILTER (WHERE done = true AND archived_at IS NOT NULL) as done_tasks_with_archived_date,
  COUNT(*) FILTER (WHERE done = false AND archived_at IS NULL) as not_done_tasks_with_null_archived,
  COUNT(*) FILTER (WHERE done = true AND is_archived = true) as done_and_properly_archived,
  COUNT(*) FILTER (WHERE done = false AND is_archived = false) as not_done_and_not_archived
FROM tasks;

