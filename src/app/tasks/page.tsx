'use client'

import { useState, useEffect } from 'react'
import { Task, CreateTaskData } from '@/types/task'
import { TaskTable } from '@/components/task-table'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database, LogOut } from 'lucide-react'
import { PageLoading } from '@/components/loading'
import { showToast } from '@/components/toast'
import { getDatabaseStatus } from '@/lib/env'
import { LocalStorageManager, SyncManager } from '@/lib/persistence'
import ProtectedRoute from '@/components/protected-route'
import { useAuth } from '@/contexts/auth-context'

function TasksPageContent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { logout, username } = useAuth()

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

      if (!response.ok) {
        showToast.dismiss(toastId)
        showToast.success('Task created (offline mode)')
        return
      }

      const data = await response.json()
      // Replace temp task with real task from database
      setTasks(prev => prev.map(t => t.id === tempId ? data.task : t))
      LocalStorageManager.saveTasks(tasks.map(t => t.id === tempId ? data.task : t))
      
      showToast.dismiss(toastId)
      showToast.success('Task created successfully')
    } catch (err) {
      showToast.dismiss(toastId)
      showToast.success('Task created (offline mode)')
    }
  }

  const updateTask = async (task: Task) => {
    try {
      // Update local state immediately for better UX
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
      
      // Try to update the database
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      })

      if (!response.ok) {
        // If database is not available, just continue with local state
        console.log('Database not available, using local state only')
        return
      }

      const data = await response.json()
      // Update with the response from server
      setTasks(prev => prev.map(t => t.id === task.id ? data.task : t))
    } catch (err) {
      console.log('Database not available, using local state only')
      // Don't show error to user, just continue with local state
      // The task is already updated in local state above
    }
  }

  const deleteTask = async (id: string) => {
    try {
      // Remove from local state immediately
      setTasks(prev => prev.filter(t => t.id !== id))
      
      // Try to delete from database
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        console.log('Database not available, using local state only')
        return
      }
    } catch (err) {
      console.log('Database not available, using local state only')
      // Task is already removed from local state above
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
        {/* Header with logout button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {username}!</h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <TaskTable
          tasks={tasks}
          onTaskCreate={createTask}
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
