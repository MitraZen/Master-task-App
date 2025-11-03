'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Archive } from 'lucide-react'
import { Task } from '@/types/task'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  task: Task | null
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  task,
  isDeleting = false
}: DeleteConfirmationDialogProps) {
  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Archive Task
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                This task will be moved to the archive
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Task #{task.project}-{task.task_no.toString().padStart(3, '0')}:</span>
                <span className="text-sm text-gray-900">{task.task_description}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Status: {task.status}</span>
                <span>Priority: {task.priority}</span>
                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Warning for non-completed tasks */}
          {!task.done && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Warning: Task Not Completed</p>
                  <p>This task has not been marked as done. Are you sure you want to archive an incomplete task?</p>
                </div>
              </div>
            </div>
          )}
          
          <div className={`mt-4 rounded-lg ${!task.done ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} border p-3`}>
            <div className="flex items-start gap-2">
              <Archive className={`h-4 w-4 ${!task.done ? 'text-yellow-600' : 'text-blue-600'} mt-0.5 flex-shrink-0`} />
              <div className={`text-sm ${!task.done ? 'text-yellow-800' : 'text-blue-800'}`}>
                <p className="font-medium">Archive Information:</p>
                <p>This task will be moved to the archive where you can restore it later or permanently delete it from the Archive page.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archive Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
