'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  ArrowLeft,
  CheckCircle,
  Circle
} from 'lucide-react'
import { showToast } from '@/components/toast'
import Link from 'next/link'

export default function ArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
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
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId)
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
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null)
      }

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
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null)
      }

      showToast.success('Task permanently deleted')
    } catch (error) {
      console.error('Error deleting task:', error)
      showToast.error('Failed to delete task')
    } finally {
      setIsOperating(false)
    }
  }

  const handleRestoreSelected = async () => {
    if (!selectedTaskId) {
      showToast.error('Please select a task to restore')
      return
    }

    await handleRestoreTask(selectedTaskId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800'
      case 'Overdue':
        return 'bg-red-100 text-red-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
          <div className="flex items-center justify-between mb-4">
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

          {/* Restore Selected Button */}
          {selectedTaskId && (
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleRestoreSelected}
                disabled={isOperating}
                className="bg-green-600 hover:bg-green-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore Selected Task
              </Button>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        {tasks.length === 0 ? (
          <div className="border rounded-lg p-12 text-center bg-white">
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
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-600 text-white">
                  <TableHead className="text-white font-semibold w-12 py-2 text-center">Select</TableHead>
                  <TableHead className="text-white font-semibold w-20 py-2">Task No</TableHead>
                  <TableHead className="text-white font-semibold w-24 py-2">Stage Gates</TableHead>
                  <TableHead className="text-white font-semibold w-28 py-2">Task Type</TableHead>
                  <TableHead className="text-white font-semibold w-20 py-2">Frequency</TableHead>
                  <TableHead className="text-white font-semibold w-20 py-2">Priority</TableHead>
                  <TableHead className="text-white font-semibold w-96 py-2">Task Description</TableHead>
                  <TableHead className="text-white font-semibold w-24 py-2">Assigned To</TableHead>
                  <TableHead className="text-white font-semibold w-24 py-2">Due Date</TableHead>
                  <TableHead className="text-white font-semibold w-28 py-2">ETR</TableHead>
                  <TableHead className="text-white font-semibold w-24 py-2">Status</TableHead>
                  <TableHead className="text-white font-semibold w-32 py-2">Archived At</TableHead>
                  <TableHead className="text-white font-semibold w-24 py-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50">
                    <TableCell className="text-center py-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTask(task.id)}
                        disabled={isOperating}
                        className="p-1 h-6 w-6 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full"
                      >
                        {selectedTaskId === task.id ? (
                          <CheckCircle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-center py-2">
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                        {task.project}-{task.task_no.toString().padStart(3, '0')}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-1.5 py-0.5">
                        {task.stage_gates}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs px-1.5 py-0.5">
                        {task.task_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs py-2">{task.frequency}</TableCell>
                    <TableCell className="text-center py-2">
                      <Badge className={`${getPriorityColor(task.priority)} text-xs px-1.5 py-0.5`}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-96 py-2">
                      <div className="whitespace-normal break-words text-gray-900 text-xs leading-tight">
                        {task.task_description}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs py-2">{task.assigned_to === 'none' ? 'None' : (task.assigned_to || 'None')}</TableCell>
                    <TableCell className="text-center text-xs py-2">{formatDate(task.due_date)}</TableCell>
                    <TableCell className="text-center py-2">
                      {(() => {
                        // Show completion date if task is complete, otherwise show days remaining
                        if (task.done && task.completed_at) {
                          return (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              {formatDate(task.completed_at)}
                            </span>
                          )
                        } else {
                          const today = new Date()
                          const due = new Date(task.due_date)
                          const diffTime = due.getTime() - today.getTime()
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          return (
                            <span className={`${diffDays < 0 ? 'bg-red-500 text-white' : 'bg-blue-500 text-black'} text-xs px-1.5 py-0.5 rounded`}>
                              {diffDays >= 0 ? `+${diffDays}` : `${diffDays}`}
                            </span>
                          )
                        }
                      })()}
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <Badge className={`${getStatusColor(task.status)} text-xs px-1.5 py-0.5`}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs py-2 text-gray-600">
                      {formatDateTime(task.archived_at || task.updated_at)}
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreTask(task.id)}
                          disabled={isOperating}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                          title="Restore"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePermanentDelete(task.id)}
                          disabled={isOperating}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          title="Delete Permanently"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
