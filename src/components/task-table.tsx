'use client'

import { useState, useEffect } from 'react'
import { Task, CreateTaskData } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Edit, Trash2 } from 'lucide-react'
import { TaskModal } from './task-modal'
import { TaskFilters } from './task-filters'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'

interface TaskTableProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (id: string) => void
  onTaskCreate: (task: CreateTaskData) => void
}

export function TaskTable({ tasks, onTaskUpdate, onTaskDelete, onTaskCreate }: TaskTableProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

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

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      onTaskDelete(taskToDelete.id)
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setTaskToDelete(null)
  }

  const handleTaskSave = async (taskData: CreateTaskData) => {
    if (editingTask) {
      onTaskUpdate({ 
        ...taskData, 
        id: editingTask.id,
        task_no: editingTask.task_no,
        is_archived: editingTask.is_archived,
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
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-700">
            Add Task
          </Button>
        </div>
      </div>

      <TaskFilters tasks={tasks} onFilter={setFilteredTasks} />

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-600 text-white">
              <TableHead className="text-white font-semibold w-20 py-2">Task No</TableHead>
              <TableHead className="text-white font-semibold w-24 py-2">Stage Gates</TableHead>
              <TableHead className="text-white font-semibold w-28 py-2">Task Type</TableHead>
              <TableHead className="text-white font-semibold w-20 py-2">Frequency</TableHead>
              <TableHead className="text-white font-semibold w-20 py-2">Priority</TableHead>
              <TableHead className="text-white font-semibold w-96 py-2">Task Description</TableHead>
              <TableHead className="text-white font-semibold w-24 py-2">Assigned To</TableHead>
              <TableHead className="text-white font-semibold w-24 py-2">Start Date</TableHead>
              <TableHead className="text-white font-semibold w-24 py-2">Due Date</TableHead>
              <TableHead className="text-white font-semibold w-28 py-2">ETR (Est. Time Rem.)</TableHead>
              <TableHead className="text-white font-semibold w-24 py-2">Status</TableHead>
              <TableHead className="text-white font-semibold w-16 py-2">Done</TableHead>
              <TableHead className="text-white font-semibold w-48 py-2">Notes</TableHead>
              <TableHead className="text-white font-semibold w-24 py-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-gray-50">
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
                <TableCell className="text-center text-xs py-2">{formatDate(task.start_date)}</TableCell>
                <TableCell className="text-center text-xs py-2">{formatDate(task.due_date)}</TableCell>
                <TableCell className="text-center py-2">
                  <span className={`${getETRStyling(calculateDaysRemaining(task.due_date))} text-xs px-1.5 py-0.5 rounded`}>
                    {calculateDaysRemaining(task.due_date) >= 0 ? `+${calculateDaysRemaining(task.due_date)}` : `${calculateDaysRemaining(task.due_date)}`}
                  </span>
                </TableCell>
                <TableCell className="text-center py-2">
                  <Badge className={`${getStatusColor(task.status)} text-xs px-1.5 py-0.5`}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDone(task)}
                    className="p-1 h-6 w-6"
                  >
                    {task.done ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="text-xs py-2">
                  <div className="whitespace-normal break-words text-gray-600 max-w-48 leading-tight">
                    {task.notes || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-center py-2">
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(task)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
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

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        task={taskToDelete}
      />
    </div>
  )
}
