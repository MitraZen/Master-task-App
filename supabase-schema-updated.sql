-- Updated schema for Master Task Tracker with new columns and admin functionality

-- Create dropdown_options table for admin management
CREATE TABLE IF NOT EXISTS dropdown_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL,
  option_value TEXT NOT NULL,
  option_label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(field_name, option_value)
);

-- Create tasks table with new columns (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_no INTEGER GENERATED ALWAYS AS IDENTITY, -- Auto-incrementing task number
  project TEXT NOT NULL DEFAULT 'DEFAULT', -- Project identifier
  stage_gates TEXT NOT NULL CHECK (stage_gates IN ('SG1', 'SG2', 'SG3', 'SG4', 'SG5', 'FID', 'FDD')),
  task_type TEXT NOT NULL CHECK (task_type IN ('Initiation', 'Requirements', 'Design', 'Development', 'Testing', 'ERS', 'S&T', 'SOM', 'Snow', 'Go_Live', 'Discovery', 'Cutover', 'AtD', 'AtO', 'KT', 'Hypercare')),
  frequency TEXT NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Yearly', 'Adhoc')),
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  task_description TEXT NOT NULL, -- Renamed from task_name
  assigned_to TEXT,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  est_hours NUMERIC(10,2) DEFAULT 0, -- Deprecated: kept for compatibility, ETR is now calculated from due_date
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Complete', 'Overdue', 'On-Hold')),
  percent_complete NUMERIC(5,2) DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  done BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing CHECK constraint to include On-Hold status
DO $$ 
BEGIN
    -- Drop existing status constraint and add new one with On-Hold
    -- Use a more robust approach that works regardless of constraint name
    BEGIN
        ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
        ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check1;
        ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check2;
        -- Add the new constraint
        ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
        CHECK (status IN ('Not Started', 'In Progress', 'Complete', 'Overdue', 'On-Hold'));
    EXCEPTION
        WHEN OTHERS THEN
            -- If there's any error, just continue
            NULL;
    END;
END $$;

-- Add missing columns to existing tasks table
DO $$ 
BEGIN
    -- Add project column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'project'
    ) THEN
        ALTER TABLE tasks ADD COLUMN project TEXT NOT NULL DEFAULT 'DEFAULT';
    END IF;
    
    -- Add task_no column (as regular integer, not identity for existing table)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'task_no'
    ) THEN
        ALTER TABLE tasks ADD COLUMN task_no INTEGER;
        -- Create a sequence for task_no
        CREATE SEQUENCE IF NOT EXISTS tasks_task_no_seq;
        -- Set default value to use the sequence
        ALTER TABLE tasks ALTER COLUMN task_no SET DEFAULT nextval('tasks_task_no_seq');
        -- Update existing rows with sequential numbers
        UPDATE tasks SET task_no = nextval('tasks_task_no_seq') WHERE task_no IS NULL;
    END IF;

    -- Add stage_gates column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'stage_gates'
    ) THEN
        ALTER TABLE tasks ADD COLUMN stage_gates TEXT DEFAULT 'SG1';
        -- Add check constraint
        ALTER TABLE tasks ADD CONSTRAINT tasks_stage_gates_check 
        CHECK (stage_gates IN ('SG1', 'SG2', 'SG3', 'SG4', 'SG5', 'FID', 'FDD'));
    END IF;

    -- Add task_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'task_type'
    ) THEN
        ALTER TABLE tasks ADD COLUMN task_type TEXT DEFAULT 'Initiation';
        -- Add check constraint
        ALTER TABLE tasks ADD CONSTRAINT tasks_task_type_check 
        CHECK (task_type IN ('Initiation', 'Requirements', 'Design', 'Development', 'Testing', 'ERS', 'S&T', 'SOM', 'Snow', 'Go_Live', 'Discovery', 'Cutover', 'AtD', 'AtO', 'KT', 'Hypercare'));
    END IF;

    -- Rename task_name to task_description if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'task_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'task_description'
    ) THEN
        ALTER TABLE tasks RENAME COLUMN task_name TO task_description;
    END IF;

    -- Add assigned_to column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE tasks ADD COLUMN assigned_to TEXT;
    END IF;
END $$;

-- Create task_fields_config table
CREATE TABLE IF NOT EXISTS task_fields_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL UNIQUE,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
  visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sort_order column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'task_fields_config' 
        AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE task_fields_config ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Insert default dropdown options
INSERT INTO dropdown_options (field_name, option_value, option_label, sort_order) VALUES
  -- Projects
  ('project', 'DEFAULT', 'Default Project', 1),
  ('project', 'PROJ-A', 'Project Alpha', 2),
  ('project', 'PROJ-B', 'Project Beta', 3),
  ('project', 'PROJ-C', 'Project Charlie', 4),
  ('project', 'MAINT', 'Maintenance', 5),
  ('project', 'R&D', 'Research & Development', 6),
  
  -- Stage Gates
  ('stage_gates', 'SG1', 'SG1', 1),
  ('stage_gates', 'SG2', 'SG2', 2),
  ('stage_gates', 'SG3', 'SG3', 3),
  ('stage_gates', 'SG4', 'SG4', 4),
  ('stage_gates', 'SG5', 'SG5', 5),
  ('stage_gates', 'FID', 'FID', 6),
  ('stage_gates', 'FDD', 'FDD', 7),
  
  -- Task Types
  ('task_type', 'Initiation', 'Initiation', 1),
  ('task_type', 'Requirements', 'Requirements', 2),
  ('task_type', 'Design', 'Design', 3),
  ('task_type', 'Development', 'Development', 4),
  ('task_type', 'Testing', 'Testing', 5),
  ('task_type', 'ERS', 'ERS', 6),
  ('task_type', 'S&T', 'S&T', 7),
  ('task_type', 'SOM', 'SOM', 8),
  ('task_type', 'Snow', 'Snow', 9),
  ('task_type', 'Go_Live', 'Go Live', 10),
  ('task_type', 'Discovery', 'Discovery', 11),
  ('task_type', 'Cutover', 'Cutover', 12),
  ('task_type', 'AtD', 'AtD', 13),
  ('task_type', 'AtO', 'AtO', 14),
  ('task_type', 'KT', 'KT', 15),
  ('task_type', 'Hypercare', 'Hypercare', 16),
  
  -- Frequency
  ('frequency', 'Daily', 'Daily', 1),
  ('frequency', 'Weekly', 'Weekly', 2),
  ('frequency', 'Monthly', 'Monthly', 3),
  ('frequency', 'Yearly', 'Yearly', 4),
  ('frequency', 'Adhoc', 'Adhoc', 5),
  
  -- Priority
  ('priority', 'High', 'High', 1),
  ('priority', 'Medium', 'Medium', 2),
  ('priority', 'Low', 'Low', 3),
  
  -- Status
  ('status', 'Not Started', 'Not Started', 1),
  ('status', 'In Progress', 'In Progress', 2),
  ('status', 'Complete', 'Complete', 3),
  ('status', 'Overdue', 'Overdue', 4),
  
  -- Assigned To
  ('assigned_to', 'Myself', 'Myself', 1),
  ('assigned_to', 'Team', 'Team', 2)
ON CONFLICT (field_name, option_value) DO NOTHING;

-- Insert default field configurations
INSERT INTO task_fields_config (field_name, field_type, visible, sort_order) VALUES
  ('task_no', 'number', true, 1),
  ('project', 'select', true, 2),
  ('stage_gates', 'select', true, 3),
  ('task_type', 'select', true, 4),
  ('frequency', 'select', true, 5),
  ('priority', 'select', true, 6),
  ('task_description', 'text', true, 7),
  ('assigned_to', 'text', true, 8),
  ('start_date', 'date', true, 9),
  ('due_date', 'date', true, 9),
  ('est_hours', 'number', false, 10), -- Deprecated: ETR is now calculated from due_date
  ('status', 'select', true, 11),
  ('percent_complete', 'number', true, 12),
  ('done', 'boolean', true, 13),
  ('notes', 'text', true, 14)
ON CONFLICT (field_name) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dropdown_options_updated_at ON dropdown_options;
CREATE TRIGGER update_dropdown_options_updated_at BEFORE UPDATE ON dropdown_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set status to 'Overdue' when due_date passes
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if task is overdue
  IF NEW.due_date < CURRENT_DATE AND NEW.status != 'Complete' THEN
    NEW.status = 'Overdue';
  END IF;
  
  -- If task is marked as done, set percent_complete to 100 and status to Complete
  IF NEW.done = TRUE THEN
    NEW.percent_complete = 100;
    NEW.status = 'Complete';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS check_overdue_tasks_trigger ON tasks;
CREATE TRIGGER check_overdue_tasks_trigger BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION check_overdue_tasks();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_fields_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on task_fields_config" ON task_fields_config;
CREATE POLICY "Allow all operations on task_fields_config" ON task_fields_config FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on dropdown_options" ON dropdown_options;
CREATE POLICY "Allow all operations on dropdown_options" ON dropdown_options FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_task_no ON tasks(task_no);
CREATE INDEX IF NOT EXISTS idx_tasks_stage_gates ON tasks(stage_gates);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_dropdown_options_field_name ON dropdown_options(field_name);
