export interface Task {
  id: string
  task_no: number
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
  percent_complete: number
  done: boolean
  notes?: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}
