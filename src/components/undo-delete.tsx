'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Undo2, X } from 'lucide-react'
import { Task } from '@/types/task'
import { showToast } from '@/components/toast'

interface UndoDeleteProps {
  deletedTask: Task | null
  onUndo: (task: Task) => void
  onDismiss: () => void
}

export function UndoDelete({ deletedTask, onUndo, onDismiss }: UndoDeleteProps) {
  const [timeLeft, setTimeLeft] = useState(10)
  const onDismissRef = useRef(onDismiss)

  // Update the ref when onDismiss changes
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!deletedTask) return

    // Reset timer when a new task is deleted
    setTimeLeft(10)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onDismissRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [deletedTask]) // Only depend on deletedTask, not onDismiss

  if (!deletedTask) return null

  const handleUndo = () => {
    onUndo(deletedTask)
    showToast.success('Task restored successfully')
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md mx-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Undo2 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Task deleted
            </p>
            <p className="text-xs text-gray-600 truncate">
              Task #{deletedTask.project}-{deletedTask.task_no.toString().padStart(3, '0')}: {deletedTask.task_description}
            </p>
            <p className="text-xs text-gray-500">
              Undo available for <span className="font-semibold text-red-600">{timeLeft}</span> seconds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              className="h-8 px-3 text-xs"
            >
              <Undo2 className="h-3 w-3 mr-1" />
              Undo
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-green-500 h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
