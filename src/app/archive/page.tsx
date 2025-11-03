'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  User, 
  ArrowLeft,
  CheckSquare,
  Square
} from 'lucide-react'
import { showToast } from '@/components/toast'
import Link from 'next/link'

export default function ArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isOperating, setIsOperating] = useState(false)

  const fetchArchivedTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/archive')
      
      if (!response.ok) {
        throw new Error('Failed to fetch archived tasks')
      }
      
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Error fetching archived tasks:', error)
      showToast.error('Failed to load archived tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArchivedTasks()
  }, [])

  const handleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(tasks.map(task => task.id)))
    }
  }

  const handleRestoreTask = async (taskId: string) => {
    try {
      setIsOperating(true)
      const response = await fetch('/api/archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      })

      if (!response.ok) {
        throw new Error('Failed to restore task')
      }

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
      setSelectedTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })

      showToast.success('Task restored successfully')
    } catch (error) {
      console.error('Error restoring task:', error)
      showToast.error('Failed to restore task')
    } finally {
      setIsOperating(false)
    }
  }

  const handlePermanentDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      return
    }

    try {
      setIsOperating(true)
      const response = await fetch('/api/archive', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
      setSelectedTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })

      showToast.success('Task permanently deleted')
    } catch (error) {
      console.error('Error deleting task:', error)
      showToast.error('Failed to delete task')
    } finally {
      setIsOperating(false)
    }
  }

  const handleBulkRestore = async () => {
    if (selectedTasks.size === 0) return

    try {
      setIsOperating(true)
      const restorePromises = Array.from(selectedTasks).map(taskId =>
        fetch('/api/archive', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        })
      )

      await Promise.all(restorePromises)

      // Remove restored tasks from local state
      setTasks(prev => prev.filter(task => !selectedTasks.has(task.id)))
      setSelectedTasks(new Set())

      showToast.success(`${selectedTasks.size} tasks restored successfully`)
    } catch (error) {
      console.error('Error restoring tasks:', error)
      showToast.error('Failed to restore some tasks')
    } finally {
      setIsOperating(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return

    if (!confirm(`Are you sure you want to permanently delete ${selectedTasks.size} tasks? This action cannot be undone.`)) {
      return
    }

    try {
      setIsOperating(true)
      const deletePromises = Array.from(selectedTasks).map(taskId =>
        fetch('/api/archive', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        })
      )

      await Promise.all(deletePromises)

      // Remove deleted tasks from local state
      setTasks(prev => prev.filter(task => !selectedTasks.has(task.id)))
      setSelectedTasks(new Set())

      showToast.success(`${selectedTasks.size} tasks permanently deleted`)
    } catch (error) {
      console.error('Error deleting tasks:', error)
      showToast.error('Failed to delete some tasks')
    } finally {
      setIsOperating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading archived tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/tasks">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tasks
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Archive className="h-8 w-8 mr-3 text-orange-600" />
                  Archive
                </h1>
                <p className="text-gray-600 mt-1">
                  {tasks.length} archived task{tasks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {tasks.length > 0 && (
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isOperating}
                >
                  {selectedTasks.size === tasks.length ? (
                    <CheckSquare className="h-4 w-4 mr-2" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  {selectedTasks.size === tasks.length ? 'Deselect All' : 'Select All'}
                </Button>
                
                {selectedTasks.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedTasks.size} selected
                  </span>
                )}
              </div>

              {selectedTasks.size > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkRestore}
                    disabled={isOperating}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isOperating}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Card className="p-12 text-center">
            <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No archived tasks</h3>
            <p className="text-gray-600 mb-6">
              Tasks that are deleted will appear here. You can restore them or permanently delete them.
            </p>
            <Link href="/tasks">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={selectedTasks.has(task.id)}
                    onCheckedChange={() => handleSelectTask(task.id)}
                    disabled={isOperating}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {task.project}-{task.task_no.toString().padStart(3, '0')}
                          </h3>
                          <Badge variant="secondary">{task.stage_gates}</Badge>
                          <Badge variant="outline">{task.task_type}</Badge>
                        </div>
                        
                        <p className="text-gray-900 mb-3">{task.task_description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {formatDate(task.due_date)}
                          </div>
                          {task.assigned_to && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {task.assigned_to}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Badge 
                              variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Archived: {formatDateTime(task.archived_at || task.updated_at)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreTask(task.id)}
                          disabled={isOperating}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handlePermanentDelete(task.id)}
                          disabled={isOperating}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

