export interface Task {
  id: string
  task_name: string
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Adhoc'
  priority: 'High' | 'Medium' | 'Low'
  start_date: string
  due_date: string
  est_hours: number
  status: 'Not Started' | 'In Progress' | 'Complete' | 'Overdue'
  percent_complete: number
  done: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface TaskFieldConfig {
  id: string
  field_name: string
  field_type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  visible: boolean
  options?: string[] // For select fields
  created_at: string
}

export interface CreateTaskData {
  task_name: string
  frequency: Task['frequency']
  priority: Task['priority']
  start_date: string
  due_date: string
  est_hours: number
  status: Task['status']
  percent_complete: number
  done: boolean
  notes?: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}
