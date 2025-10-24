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
  task?: Task | null
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
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
    percent_complete: 0,
    done: false,
    notes: ''
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
        percent_complete: task.percent_complete,
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
        percent_complete: 0,
        done: false,
        notes: ''
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
                onValueChange={(value) => handleInputChange('frequency', value)}
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

            <div className="space-y-2">
              <Label htmlFor="percent_complete">% Complete</Label>
              <Input
                id="percent_complete"
                type="number"
                min="0"
                max="100"
                value={formData.percent_complete}
                onChange={(e) => handleInputChange('percent_complete', parseInt(e.target.value) || 0)}
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
