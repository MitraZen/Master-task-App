export interface Task {
  id: string
  task_no: number
  project: string
  stage_gates: string
  task_type: string
  frequency: string
  priority: string
  task_description: string
  assigned_to?: string
  start_date: string
  due_date: string
  est_hours: number
  status: string
  done: boolean
  notes?: string
  is_archived: boolean
  archived_at?: string
  created_at: string
  updated_at: string
}

export interface TaskFieldConfig {
  id: string
  field_name: string
  field_type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  visible: boolean
  sort_order: number
  created_at: string
}

export interface DropdownOption {
  id: string
  field_name: string
  option_value: string
  option_label: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  project: string
  stage_gates: Task['stage_gates']
  task_type: Task['task_type']
  frequency: Task['frequency']
  priority: Task['priority']
  task_description: string
  assigned_to?: string
  start_date: string
  due_date: string
  est_hours: number
  status: Task['status']
  done: boolean
  notes?: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}
