'use client'

import { useState } from 'react'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Input } from '@/components/ui/input'
import { Filter, X } from 'lucide-react'

interface TaskFiltersProps {
  tasks: Task[]
  onFilter: (filteredTasks: Task[]) => void
}

export function TaskFilters({ tasks, onFilter }: TaskFiltersProps) {
  const [filters, setFilters] = useState({
    priority: 'all',
    status: [] as string[], // Changed to array for multi-select
    frequency: 'all',
    stage_gates: 'all',
    task_type: 'all',
    assigned_to: 'all',
    search: ''
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(tasks, newFilters)
  }

  const handleMultiSelectChange = (key: string, value: string[]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(tasks, newFilters)
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...filters, [key]: '' }
    setFilters(newFilters)
    applyFilters(tasks, newFilters)
  }

  const applyFilters = (taskList: Task[], currentFilters: typeof filters) => {
    let filtered = [...taskList]

    // Apply search filter
    if (currentFilters.search) {
      filtered = filtered.filter(task =>
        task.task_description.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        (task.assigned_to && task.assigned_to.toLowerCase().includes(currentFilters.search.toLowerCase())) ||
        (task.notes && task.notes.toLowerCase().includes(currentFilters.search.toLowerCase()))
      )
    }

    // Apply priority filter
    if (currentFilters.priority && currentFilters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === currentFilters.priority)
    }

    // Apply status filter
    if (currentFilters.status && currentFilters.status.length > 0) {
      filtered = filtered.filter(task => currentFilters.status.includes(task.status))
    }

    // Apply frequency filter
    if (currentFilters.frequency && currentFilters.frequency !== 'all') {
      filtered = filtered.filter(task => task.frequency === currentFilters.frequency)
    }

    // Apply stage gates filter
    if (currentFilters.stage_gates && currentFilters.stage_gates !== 'all') {
      filtered = filtered.filter(task => task.stage_gates === currentFilters.stage_gates)
    }

    // Apply task type filter
    if (currentFilters.task_type && currentFilters.task_type !== 'all') {
      filtered = filtered.filter(task => task.task_type === currentFilters.task_type)
    }

    // Apply assigned to filter
    if (currentFilters.assigned_to && currentFilters.assigned_to !== 'all') {
      filtered = filtered.filter(task => task.assigned_to === currentFilters.assigned_to)
    }

    onFilter(filtered)
  }

  const clearFilters = () => {
    const clearedFilters = {
      priority: 'all',
      status: [] as string[],
      frequency: 'all',
      stage_gates: 'all',
      task_type: 'all',
      assigned_to: 'all',
      search: ''
    }
    setFilters(clearedFilters)
    onFilter(tasks)
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== ''
    if (key === 'status') return Array.isArray(value) && value.length > 0
    return value !== '' && value !== 'all'
  })

  // Get unique values for dropdowns
  const priorities = [...new Set(tasks.map(task => task.priority))]
  const statuses = [...new Set(tasks.map(task => task.status))]
  const frequencies = [...new Set(tasks.map(task => task.frequency))]
  const stageGates = [...new Set(tasks.map(task => task.stage_gates))]
  const taskTypes = [...new Set(tasks.map(task => task.task_type))]
  const assignedTo = [...new Set(tasks.map(task => task.assigned_to).filter(Boolean))] as string[]

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-700">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Search</label>
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stage Gates</label>
          <Select
            value={filters.stage_gates}
            onValueChange={(value) => handleFilterChange('stage_gates', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Stage Gates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stage Gates</SelectItem>
              {stageGates.map(stageGate => (
                <SelectItem key={stageGate} value={stageGate}>
                  {stageGate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Task Type</label>
          <Select
            value={filters.task_type}
            onValueChange={(value) => handleFilterChange('task_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Task Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Task Types</SelectItem>
              {taskTypes.map(taskType => (
                <SelectItem key={taskType} value={taskType}>
                  {taskType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Priority</label>
          <Select
            value={filters.priority}
            onValueChange={(value) => handleFilterChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <MultiSelect
            options={statuses}
            value={filters.status}
            onChange={(value) => handleMultiSelectChange('status', value)}
            placeholder="All Statuses"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Frequency</label>
          <Select
            value={filters.frequency}
            onValueChange={(value) => handleFilterChange('frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Frequencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              {frequencies.map(frequency => (
                <SelectItem key={frequency} value={frequency}>
                  {frequency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Assigned To</label>
          <Select
            value={filters.assigned_to}
            onValueChange={(value) => handleFilterChange('assigned_to', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {assignedTo.map(assignee => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sort By</label>
          <Select
            onValueChange={(value) => {
              // This would need to be implemented with the parent component
              console.log('Sort by:', value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="start_date">Start Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="task_description">Task Description</SelectItem>
              <SelectItem value="task_no">Task Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
