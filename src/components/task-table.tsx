'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Edit, Trash2 } from 'lucide-react'
import { TaskModal } from './task-modal'
import { TaskFilters } from './task-filters'

interface TaskTableProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (id: string) => void
  onTaskCreate: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
}

export function TaskTable({ tasks, onTaskUpdate, onTaskDelete, onTaskCreate }: TaskTableProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)

  useEffect(() => {
    setFilteredTasks(tasks)
  }, [tasks])

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleTaskSave = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
      onTaskUpdate({ 
        ...taskData, 
        id: editingTask.id,
        created_at: editingTask.created_at,
        updated_at: editingTask.updated_at
      })
    } else {
      onTaskCreate(taskData)
    }
    handleModalClose()
  }

  const handleToggleDone = async (task: Task) => {
    const updatedTask = {
      ...task,
      done: !task.done,
      percent_complete: !task.done ? 100 : 0,
      status: !task.done ? 'Complete' as const : 'Not Started' as const
    }
    onTaskUpdate(updatedTask)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getETRStyling = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return 'bg-red-500 text-white px-2 py-1 rounded text-sm font-medium'
    } else {
      return 'bg-blue-500 text-black px-2 py-1 rounded text-sm font-medium'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Simple Task Tracker</h1>
        <Button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-700">
          Add Task
        </Button>
      </div>

      <TaskFilters tasks={tasks} onFilter={setFilteredTasks} />

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-600 text-white">
              <TableHead className="text-white font-semibold">Task Name</TableHead>
              <TableHead className="text-white font-semibold">Frequency</TableHead>
              <TableHead className="text-white font-semibold">Priority</TableHead>
              <TableHead className="text-white font-semibold">Start Date</TableHead>
              <TableHead className="text-white font-semibold">Due Date</TableHead>
              <TableHead className="text-white font-semibold">ETR (Est. Time Rem.)</TableHead>
              <TableHead className="text-white font-semibold">Status</TableHead>
              <TableHead className="text-white font-semibold">% Complete</TableHead>
              <TableHead className="text-white font-semibold">Done</TableHead>
              <TableHead className="text-white font-semibold">Notes</TableHead>
              <TableHead className="text-white font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{task.task_name}</TableCell>
                <TableCell>{task.frequency}</TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(task.start_date)}</TableCell>
                <TableCell>{formatDate(task.due_date)}</TableCell>
                <TableCell>
                  <span className={getETRStyling(calculateDaysRemaining(task.due_date))}>
                    {calculateDaysRemaining(task.due_date) >= 0 ? `+${calculateDaysRemaining(task.due_date)}` : `${calculateDaysRemaining(task.due_date)}`}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="w-32">
                  <div className="flex items-center space-x-2">
                    <Progress value={task.percent_complete} className="flex-1" />
                    <span className="text-sm text-gray-600 w-12">
                      {task.percent_complete}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDone(task)}
                    className="p-0 h-auto"
                  >
                    {task.done ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="max-w-xs truncate">{task.notes}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskDelete(task.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleTaskSave}
        task={editingTask}
      />
    </div>
  )
}
