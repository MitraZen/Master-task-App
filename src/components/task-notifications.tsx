'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, AlertTriangle, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface TaskNotificationsProps {
  tasks: Task[]
}

interface NotificationTask {
  task: Task
  type: 'today' | 'this_week'
  urgency: 'high' | 'medium' | 'low'
}

export function TaskNotifications({ tasks }: TaskNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationTask[]>([])

  // Helper functions for date checking (same as in task-filters.tsx)
  const isToday = (dateString: string) => {
    const today = new Date()
    const taskDate = new Date(dateString)
    return taskDate.toDateString() === today.toDateString()
  }

  const isThisWeek = (dateString: string) => {
    const today = new Date()
    const taskDate = new Date(dateString)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of current week (Sunday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of current week (Saturday)
    
    return taskDate >= startOfWeek && taskDate <= endOfWeek
  }

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date()
    const dueDate = new Date(dateString)
    const diffTime = dueDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getUrgencyLevel = (daysUntilDue: number, priority: string) => {
    if (daysUntilDue < 0) return 'high' // Overdue
    if (daysUntilDue === 0) return 'high' // Due today
    if (daysUntilDue <= 2 && priority === 'High') return 'high'
    if (daysUntilDue <= 3) return 'medium'
    return 'low'
  }

  useEffect(() => {
    const generateNotifications = () => {
      const notificationTasks: NotificationTask[] = []

      tasks.forEach(task => {
        if (task.is_archived) return // Skip archived tasks
        if (task.done || task.status === 'Complete') return // Skip completed tasks

        const daysUntilDue = getDaysUntilDue(task.due_date)
        const urgency = getUrgencyLevel(daysUntilDue, task.priority)

        // Tasks due today
        if (isToday(task.due_date)) {
          notificationTasks.push({
            task,
            type: 'today',
            urgency
          })
        }
        // Tasks due this week (but not today)
        else if (isThisWeek(task.due_date) && daysUntilDue > 0) {
          notificationTasks.push({
            task,
            type: 'this_week',
            urgency
          })
        }
      })

      // Sort by urgency and due date
      notificationTasks.sort((a, b) => {
        if (a.urgency !== b.urgency) {
          const urgencyOrder = { high: 3, medium: 2, low: 1 }
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        }
        return getDaysUntilDue(a.task.due_date) - getDaysUntilDue(b.task.due_date)
      })

      setNotifications(notificationTasks)
    }

    generateNotifications()
  }, [tasks])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationText = (notification: NotificationTask) => {
    const daysUntilDue = getDaysUntilDue(notification.task.due_date)
    const taskNumber = `${notification.task.project}-${notification.task.task_no.toString().padStart(3, '0')}`
    
    if (daysUntilDue < 0) {
      return `${taskNumber}: ${notification.task.task_description} (Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''})`
    } else if (daysUntilDue === 0) {
      return `${taskNumber}: ${notification.task.task_description} (Due Today)`
    } else {
      return `${taskNumber}: ${notification.task.task_description} (Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''})`
    }
  }

  const totalNotifications = notifications.length
  const todayNotifications = notifications.filter(n => n.type === 'today').length
  const weekNotifications = notifications.filter(n => n.type === 'this_week').length

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative p-2"
        >
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white"
            >
              {totalNotifications}
            </Badge>
          )}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Task Notifications
              {totalNotifications > 0 && (
                <Badge className="bg-red-500 text-white">
                  {totalNotifications}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {totalNotifications === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">
                You're all caught up! No tasks due today or this week.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-gray-700">Due Today: {todayNotifications}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">Due This Week: {weekNotifications}</span>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={`${notification.task.id}-${index}`}
                    className={`border rounded-lg p-4 ${getUrgencyColor(notification.urgency)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getUrgencyIcon(notification.urgency)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getUrgencyColor(notification.urgency)}`}
                          >
                            {notification.type === 'today' ? 'Due Today' : 'Due This Week'}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getUrgencyColor(notification.urgency)}`}
                          >
                            {notification.task.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {getNotificationText(notification)}
                        </p>
                        <div className="text-xs text-gray-600">
                          <div>Project: {notification.task.project}</div>
                          <div>Assigned to: {notification.task.assigned_to || 'None'}</div>
                          <div>Status: {notification.task.status}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

