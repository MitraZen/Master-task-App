-- Script to fix tasks that are incorrectly marked as archived
-- Run this in your Supabase SQL Editor

-- First, let's see how many tasks are incorrectly archived
-- Tasks should only be archived if they were explicitly archived by the user
-- If a task has is_archived = true but archived_at is NULL, it's incorrectly archived

-- Check for tasks that are marked as archived but shouldn't be:
-- (Tasks with is_archived = true but archived_at = NULL)
SELECT 
  COUNT(*) as incorrectly_archived_count,
  COUNT(*) FILTER (WHERE archived_at IS NULL) as missing_archived_at
FROM tasks 
WHERE is_archived = true;

-- Fix tasks that have is_archived = true but archived_at = NULL
-- These should be unarchived (set is_archived = false)
UPDATE tasks 
SET 
  is_archived = false,
  archived_at = NULL
WHERE is_archived = true 
  AND archived_at IS NULL;

-- Verify the fix
-- This should return 0 after the update
SELECT COUNT(*) as remaining_incorrectly_archived
FROM tasks 
WHERE is_archived = true 
  AND archived_at IS NULL;

-- Show summary of archived tasks
SELECT 
  COUNT(*) as total_archived_tasks,
  COUNT(*) FILTER (WHERE archived_at IS NOT NULL) as properly_archived,
  COUNT(*) FILTER (WHERE archived_at IS NULL) as improperly_archived
FROM tasks 
WHERE is_archived = true;

