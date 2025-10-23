-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Yearly', 'Adhoc')),
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  est_hours NUMERIC(10,2) DEFAULT 0, -- Deprecated: kept for compatibility, ETR is now calculated from due_date
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Complete', 'Overdue')),
  percent_complete NUMERIC(5,2) DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  done BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_fields_config table
CREATE TABLE IF NOT EXISTS task_fields_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL UNIQUE,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
  visible BOOLEAN DEFAULT TRUE,
  options JSONB, -- For select fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default field configurations
INSERT INTO task_fields_config (field_name, field_type, visible) VALUES
  ('task_name', 'text', true),
  ('frequency', 'select', true),
  ('priority', 'select', true),
  ('start_date', 'date', true),
  ('due_date', 'date', true),
  ('est_hours', 'number', false), -- Deprecated: ETR is now calculated from due_date
  ('status', 'select', true),
  ('percent_complete', 'number', true),
  ('done', 'boolean', true),
  ('notes', 'text', true)
ON CONFLICT (field_name) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
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

-- Create trigger to check overdue tasks
CREATE TRIGGER check_overdue_tasks_trigger BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION check_overdue_tasks();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_fields_config ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict these later)
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on task_fields_config" ON task_fields_config FOR ALL USING (true);
