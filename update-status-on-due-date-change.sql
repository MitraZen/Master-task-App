-- Update the check_overdue_tasks function to re-evaluate status when due_date changes
-- Run this in your Supabase SQL Editor

-- Create function to automatically re-evaluate status when due_date changes
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- If task is marked as done, always set status to Complete (regardless of due_date)
  IF NEW.done = TRUE THEN
    NEW.status = 'Complete';
    RETURN NEW;
  END IF;
  
  -- Re-evaluate status based on due_date (only if task is not done)
  -- Check if due_date was changed
  IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
    -- If new due_date is in the past, set status to 'Overdue'
    IF NEW.due_date < CURRENT_DATE THEN
      NEW.status = 'Overdue';
    -- If new due_date is in the future and task was 'Overdue', reset to 'Not Started'
    ELSIF NEW.due_date >= CURRENT_DATE AND OLD.status = 'Overdue' THEN
      NEW.status = 'Not Started';
    END IF;
  ELSE
    -- If due_date hasn't changed, just check if it's overdue
    IF NEW.due_date < CURRENT_DATE AND NEW.status != 'Complete' THEN
      NEW.status = 'Overdue';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- The trigger should already exist, but this ensures it's set up correctly
DROP TRIGGER IF EXISTS check_overdue_tasks_trigger ON tasks;
CREATE TRIGGER check_overdue_tasks_trigger BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION check_overdue_tasks();

