'use client'

import { useState, useEffect } from 'react'
import { Task, CreateTaskData } from '@/types/task'
import { TaskTable } from '@/components/task-table'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database, LogOut, Archive, Settings } from 'lucide-react'
import { PageLoading } from '@/components/loading'
import { showToast } from '@/components/toast'
import { getDatabaseStatus } from '@/lib/env'
import { LocalStorageManager, SyncManager } from '@/lib/persistence'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/contexts/auth-context'
import AdminDropdownManager from '@/components/admin-dropdown-manager'

function TasksPageContent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { logout, username } = useAuth()
  
  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const dbStatus = getDatabaseStatus()
      
      if (!dbStatus.isConnected) {
        console.log('Database not configured, using local storage')
        const savedTasks = LocalStorageManager.loadTasks()
        setTasks(savedTasks)
        setError(null)
        return
      }

      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data.tasks || [])
      setError(null)
      
      // Save to localStorage for offline access
      LocalStorageManager.saveTasks(data.tasks || [])
    } catch (err) {
      console.log('Database not available, using local storage')
      const savedTasks = LocalStorageManager.loadTasks()
      setTasks(savedTasks)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: CreateTaskData) => {
    const toastId = showToast.loading('Creating task...')
    
    try {
      // Generate a temporary ID for local state
      const tempId = `temp-${Date.now()}`
      const tempTask: Task = {
        ...taskData,
        id: tempId,
        task_no: tasks.length + 1, // Temporary task number
        is_archived: false, // New tasks are not archived
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to local state immediately
      setTasks(prev => [...prev, tempTask])
      LocalStorageManager.saveTasks([...tasks, tempTask])
      
      // Try to create in database
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      console.log('Task creation response:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Task creation failed:', response.status, errorText)
        showToast.dismiss(toastId)
        showToast.success('Task created (offline mode)')
        return
      }

      const data = await response.json()
      console.log('Task creation success:', data)
      // Replace temp task with real task from database
      setTasks(prev => {
        const updatedTasks = prev.map(t => t.id === tempId ? data.task : t)
        LocalStorageManager.saveTasks(updatedTasks)
        return updatedTasks
      })
      
      showToast.dismiss(toastId)
      showToast.success('Task created successfully')
    } catch (err) {
      showToast.dismiss(toastId)
      showToast.success('Task created (offline mode)')
    }
  }

  const createMultipleTasks = async (tasksData: CreateTaskData[]) => {
    const toastId = showToast.loading(`Creating ${tasksData.length} tasks...`)
    
    try {
      const tempTasks: Task[] = []
      const tempIds: string[] = []
      
      // Generate temporary tasks for local state
      tasksData.forEach((taskData, index) => {
        const tempId = `temp-${Date.now()}-${index}`
        const tempTask: Task = {
          ...taskData,
          id: tempId,
          task_no: tasks.length + index + 1, // Temporary task numbers
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        tempTasks.push(tempTask)
        tempIds.push(tempId)
      })
      
      // Add all tasks to local state immediately
      setTasks(prev => [...prev, ...tempTasks])
      LocalStorageManager.saveTasks([...tasks, ...tempTasks])
      
      // Create tasks in database one by one
      const createdTasks: Task[] = []
      let successCount = 0
      
      for (const taskData of tasksData) {
        try {
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
          })

          if (response.ok) {
            const data = await response.json()
            createdTasks.push(data.task)
            successCount++
          } else {
            console.error('Failed to create task:', response.statusText)
          }
        } catch (err) {
          console.error('Error creating task:', err)
        }
      }
      
      // Replace temp tasks with real tasks from database
      if (createdTasks.length > 0) {
        setTasks(prev => {
          let updatedTasks = [...prev]
          createdTasks.forEach((realTask, index) => {
            const tempId = tempIds[index]
            updatedTasks = updatedTasks.map(t => t.id === tempId ? realTask : t)
          })
          LocalStorageManager.saveTasks(updatedTasks)
          return updatedTasks
        })
      }
      
      showToast.dismiss(toastId)
      if (successCount === tasksData.length) {
        showToast.success(`${successCount} tasks created successfully`)
      } else {
        showToast.success(`${successCount}/${tasksData.length} tasks created successfully`)
      }
    } catch (err) {
      showToast.dismiss(toastId)
      showToast.success(`${tasksData.length} tasks created (offline mode)`)
    }
  }

  const updateTask = async (task: Task) => {
    try {
      // Update local state immediately for better UX
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
      
      // Try to update the database
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to update task'
        console.error(`Database update failed: ${errorMessage}`)
        showToast.error(`Database error: ${errorMessage}`)
        return
      }

      const data = await response.json()
      // Update with the response from server
      setTasks(prev => prev.map(t => t.id === task.id ? data.task : t))
      
      // Save to local storage
      LocalStorageManager.saveTasks(tasks.map(t => t.id === task.id ? data.task : t))
      
      showToast.success('Task updated successfully')
    } catch (err) {
      console.error('Network error during update:', err)
      showToast.error('Network error. Task updated locally but may not be synced.')
    }
  }

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id)
    if (!taskToDelete) return

    setIsDeleting(true)
    
    try {
      // Archive the task instead of deleting it
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: id }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to archive task'
        console.error(`Archive failed: ${errorMessage}`)
        showToast.error(`Database error: ${errorMessage}`)
        return
      }

      // Remove from local state
      setTasks(prev => prev.filter(t => t.id !== id))
      
      // Save updated tasks to local storage
      const updatedTasks = tasks.filter(t => t.id !== id)
      LocalStorageManager.saveTasks(updatedTasks)
      
      showToast.success(`Task ${taskToDelete.project}-${taskToDelete.task_no.toString().padStart(3, '0')} moved to archive`)
      
    } catch (err) {
      console.error('Error during archiving:', err)
      showToast.error('Network error. Task archived locally but may not be synced.')
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  if (loading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Database className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Error</h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Please make sure you have:
            </p>
            <ul className="text-sm text-gray-500 text-left space-y-1">
              <li>• Created a Supabase project</li>
              <li>• Run the SQL schema from supabase-schema.sql</li>
              <li>• Set up your .env.local file with Supabase credentials</li>
            </ul>
          </div>
          <Button onClick={fetchTasks} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Master Task Tracker</h1>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAdminOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Button>
            <Button
              onClick={() => window.location.href = '/archive'}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <TaskTable
          tasks={tasks}
          onTaskCreate={createTask}
          onTaskCreateMultiple={createMultipleTasks}
          onTaskUpdate={updateTask}
          onTaskDelete={deleteTask}
        />
        
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first task using the "Add Task" button above.
            </p>
          </div>
        )}
        
        {/* Admin Modal */}
        <AdminDropdownManager
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
        
      </div>
    </div>
  )
}

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksPageContent />
    </ProtectedRoute>
  )
}
