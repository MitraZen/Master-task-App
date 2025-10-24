'use client'

import { useState, useEffect } from 'react'
import { Task, CreateTaskData, DropdownOption } from '@/types/task'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: CreateTaskData) => void
  onSaveMultiple?: (tasks: CreateTaskData[]) => void
  task?: Task | null
}

export function TaskModal({ isOpen, onClose, onSave, onSaveMultiple, task }: TaskModalProps) {
  const [formData, setFormData] = useState({
    project: 'DEFAULT',
    stage_gates: 'SG1',
    task_type: 'Initiation',
    frequency: 'Daily',
    priority: 'Medium',
    task_description: '',
    assigned_to: '',
    start_date: '',
    due_date: '',
    est_hours: 0,
    status: 'Not Started',
    done: false,
    notes: ''
  })

  const [recurringData, setRecurringData] = useState({
    recurring_start_date: '',
    recurring_end_date: '',
    is_recurring: false
  })

  const [assignedToOptions, setAssignedToOptions] = useState<DropdownOption[]>([])
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([])
  const [stageGatesOptions, setStageGatesOptions] = useState<DropdownOption[]>([])
  const [taskTypeOptions, setTaskTypeOptions] = useState<DropdownOption[]>([])
  const [frequencyOptions, setFrequencyOptions] = useState<DropdownOption[]>([])
  const [priorityOptions, setPriorityOptions] = useState<DropdownOption[]>([])
  const [projectOptions, setProjectOptions] = useState<DropdownOption[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchAssignedToOptions()
      fetchStatusOptions()
      fetchStageGatesOptions()
      fetchTaskTypeOptions()
      fetchFrequencyOptions()
      fetchPriorityOptions()
      fetchProjectOptions()
    }
  }, [isOpen])

  const fetchAssignedToOptions = async () => {
    try {
      const response = await fetch('/api/admin/dropdown-options?field_name=assigned_to')
      if (response.ok) {
        const data = await response.json()
        setAssignedToOptions(data.options || [])
      }
    } catch (error) {
      console.error('Error fetching assigned_to options:', error)
    }
  }

  const fetchStatusOptions = async () => {
    try {
      const response = await fetch('/api/admin/dropdown-options?field_name=status')
      if (response.ok) {
        const data = await response.json()
        setStatusOptions(data.options || [])
      }
    } catch (error) {
      console.error('Error fetching status options:', error)
    }
  }

  const fetchStageGatesOptions = async () => {
    try {
      const response = await fetch('/api/admin/dropdown-options?field_name=stage_gates')
      if (response.ok) {
        const data = await response.json()
        setStageGatesOptions(data.options || [])
      }
    } catch (error) {
      console.error('Error fetching stage_gates options:', error)
    }
  }

  const fetchTaskTypeOptions = async () => {
    try {
      const response = await fetch('/api/admin/dropdown-options?field_name=task_type')
      if (response.ok) {
        const data = await response.json()
        setTaskTypeOptions(data.options || [])
      }
    } catch (error) {
      console.error('Error fetching task_type options:', error)
    }
  }

  const fetchFrequencyOptions = async () => {
    try {
      const response = await fetch('/api/admin/dropdown-options?field_name=frequency')
      if (response.ok) {
        const data = await response.json()
        setFrequencyOptions(data.options || [])
      }
    } catch (error) {
      console.error('Error fetching frequency options:', error)
    }
  }

  const fetchPriorityOptions = async () => {
    try {
      const response = await fetch('/api/admin/dropdown-options?field_name=priority')
      if (response.ok) {
        const data = await response.json()
        setPriorityOptions(data.options || [])
      }
    } catch (error) {
      console.error('Error fetching priority options:', error)
    }
  }

  const fetchProjectOptions = async () => {
    try {
      const response = await fetch('/api/admin/dropdown-options?field_name=project')
      if (response.ok) {
        const data = await response.json()
        setProjectOptions(data.options || [])
      }
    } catch (error) {
      console.error('Error fetching project options:', error)
    }
  }

  useEffect(() => {
    if (task) {
      setFormData({
        project: task.project,
        stage_gates: task.stage_gates,
        task_type: task.task_type,
        frequency: task.frequency,
        priority: task.priority,
        task_description: task.task_description,
        assigned_to: task.assigned_to || '',
        start_date: task.start_date,
        due_date: task.due_date,
        est_hours: task.est_hours,
        status: task.status,
        done: task.done,
        notes: task.notes || ''
      })
    } else {
      setFormData({
        project: 'DEFAULT',
        stage_gates: 'SG1',
        task_type: 'Initiation',
        frequency: 'Daily',
        priority: 'Medium',
        task_description: '',
        assigned_to: '',
        start_date: '',
        due_date: '',
        est_hours: 0,
        status: 'Not Started',
        done: false,
        notes: ''
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (recurringData.is_recurring && isRecurringFrequency(formData.frequency)) {
      // Create recurring tasks
      const tasks = generateRecurringTasks()
      if (onSaveMultiple) {
        onSaveMultiple(tasks)
      } else {
        tasks.forEach(task => onSave(task))
      }
    } else {
      // Create single task
      onSave(formData)
    }
  }

  const generateRecurringTasks = (): CreateTaskData[] => {
    if (!recurringData.recurring_start_date || !recurringData.recurring_end_date) {
      return [formData]
    }

    const startDate = new Date(recurringData.recurring_start_date)
    const endDate = new Date(recurringData.recurring_end_date)
    const tasks: CreateTaskData[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const taskStartDate = new Date(currentDate)
      const taskDueDate = new Date(currentDate)
      
      // Set due date based on frequency
      switch (formData.frequency) {
        case 'Daily':
          taskDueDate.setDate(taskDueDate.getDate() + 1)
          break
        case 'Weekly':
          taskDueDate.setDate(taskDueDate.getDate() + 7)
          break
        case 'Monthly':
          taskDueDate.setMonth(taskDueDate.getMonth() + 1)
          break
        case 'Yearly':
          taskDueDate.setFullYear(taskDueDate.getFullYear() + 1)
          break
      }

      tasks.push({
        ...formData,
        start_date: taskStartDate.toISOString().split('T')[0],
        due_date: taskDueDate.toISOString().split('T')[0]
      })

      // Move to next occurrence
      switch (formData.frequency) {
        case 'Daily':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'Weekly':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'Monthly':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        case 'Yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1)
          break
      }
    }

    return tasks
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRecurringInputChange = (field: string, value: any) => {
    setRecurringData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isRecurringFrequency = (frequency: string) => {
    return ['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(frequency)
  }

  const calculateOccurrences = () => {
    if (!recurringData.recurring_start_date || !recurringData.recurring_end_date) return 0
    
    const startDate = new Date(recurringData.recurring_start_date)
    const endDate = new Date(recurringData.recurring_end_date)
    
    if (startDate >= endDate) return 0
    
    switch (formData.frequency) {
      case 'Daily':
        return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      case 'Weekly':
        return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1
      case 'Monthly':
        return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1
      case 'Yearly':
        return endDate.getFullYear() - startDate.getFullYear() + 1
      default:
        return 1
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={formData.project}
                onValueChange={(value) => handleInputChange('project', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map(option => (
                    <SelectItem key={option.option_value} value={option.option_value}>
                      {option.option_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage_gates">Stage Gates</Label>
              <Select
                value={formData.stage_gates}
                onValueChange={(value) => handleInputChange('stage_gates', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageGatesOptions.map(option => (
                    <SelectItem key={option.option_value} value={option.option_value}>
                      {option.option_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task_type">Task Type</Label>
              <Select
                value={formData.task_type}
                onValueChange={(value) => handleInputChange('task_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypeOptions.map(option => (
                    <SelectItem key={option.option_value} value={option.option_value}>
                      {option.option_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => {
                  handleInputChange('frequency', value)
                  // Reset recurring data when frequency changes
                  if (!isRecurringFrequency(value)) {
                    setRecurringData({
                      recurring_start_date: '',
                      recurring_end_date: '',
                      is_recurring: false
                    })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map(option => (
                    <SelectItem key={option.option_value} value={option.option_value}>
                      {option.option_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recurring Task Fields */}
            {isRecurringFrequency(formData.frequency) && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_recurring"
                      checked={recurringData.is_recurring}
                      onCheckedChange={(checked) => handleRecurringInputChange('is_recurring', checked)}
                    />
                    <Label htmlFor="is_recurring" className="text-sm font-medium">
                      Create recurring tasks ({formData.frequency})
                    </Label>
                  </div>
                </div>

                {recurringData.is_recurring && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="recurring_start_date">Recurring Start Date *</Label>
                      <Input
                        id="recurring_start_date"
                        type="date"
                        value={recurringData.recurring_start_date}
                        onChange={(e) => handleRecurringInputChange('recurring_start_date', e.target.value)}
                        required={recurringData.is_recurring}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recurring_end_date">Recurring End Date *</Label>
                      <Input
                        id="recurring_end_date"
                        type="date"
                        value={recurringData.recurring_end_date}
                        onChange={(e) => handleRecurringInputChange('recurring_end_date', e.target.value)}
                        required={recurringData.is_recurring}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Will create {calculateOccurrences()} tasks</strong> from{' '}
                          {recurringData.recurring_start_date} to {recurringData.recurring_end_date}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Each task will have the same details but different dates based on {formData.frequency} frequency.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.option_value} value={option.option_value}>
                      {option.option_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task_description">Task Description *</Label>
              <Input
                id="task_description"
                value={formData.task_description}
                onChange={(e) => handleInputChange('task_description', e.target.value)}
                required
                placeholder="Enter task description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => handleInputChange('assigned_to', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {assignedToOptions.map(option => (
                    <SelectItem key={option.option_value} value={option.option_value}>
                      {option.option_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.option_value} value={option.option_value}>
                      {option.option_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="est_hours">ETR (Est. Time Rem.)</Label>
              <Input
                id="est_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.est_hours}
                onChange={(e) => handleInputChange('est_hours', parseFloat(e.target.value) || 0)}
                disabled
                className="bg-gray-100 text-gray-500"
                placeholder="Auto-calculated from due date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="done"
                checked={formData.done}
                onCheckedChange={(checked) => handleInputChange('done', checked)}
              />
              <Label htmlFor="done">Mark as Done</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
