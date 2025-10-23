'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
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
  onSave: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  task?: Task | null
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [formData, setFormData] = useState({
    task_name: '',
    frequency: 'Daily' as Task['frequency'],
    priority: 'Medium' as Task['priority'],
    start_date: '',
    due_date: '',
    est_hours: 0,
    status: 'Not Started' as Task['status'],
    percent_complete: 0,
    done: false,
    notes: ''
  })

  useEffect(() => {
    if (task) {
      setFormData({
        task_name: task.task_name,
        frequency: task.frequency,
        priority: task.priority,
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
        task_name: '',
        frequency: 'Daily',
        priority: 'Medium',
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
              <Label htmlFor="task_name">Task Name *</Label>
              <Input
                id="task_name"
                value={formData.task_name}
                onChange={(e) => handleInputChange('task_name', e.target.value)}
                required
                placeholder="Enter task name"
              />
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
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                  <SelectItem value="Adhoc">Adhoc</SelectItem>
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
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
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
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
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
