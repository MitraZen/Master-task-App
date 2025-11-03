import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { UpdateTaskData } from '@/types/task'

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const body: UpdateTaskData = await request.json()
    
    // Handle both sync and async params for compatibility
    let id: string
    try {
      const params = await context.params
      id = params.id
    } catch (error) {
      // Fallback: extract ID from URL
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      id = pathParts[pathParts.length - 1]
    }

    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const { id: bodyId, ...updateData } = body

    // Get the current task to compare dates
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('start_date, due_date, status, done')
      .eq('id', id)
      .single()

    // If start_date or due_date is being updated, we need to re-evaluate status
    // The database trigger will handle this, but we can also do client-side validation
    if (updateData.start_date || updateData.due_date || updateData.done !== undefined) {
      const newStartDate = updateData.start_date ? new Date(updateData.start_date) : (currentTask ? new Date(currentTask.start_date) : null)
      const newDueDate = updateData.due_date ? new Date(updateData.due_date) : (currentTask ? new Date(currentTask.due_date) : null)
      const isDone = updateData.done !== undefined ? updateData.done : (currentTask ? currentTask.done : false)
      
      // Only auto-update status if task is not done
      if (!isDone) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (newDueDate && newDueDate < today) {
          // Due date is in the past -> Overdue
          updateData.status = 'Overdue'
        } else if (newDueDate && newDueDate >= today) {
          // Due date is today or in the future
          if (newStartDate && newStartDate > today) {
            // Start date is in the future -> Not Started
            updateData.status = 'Not Started'
          } else {
            // Start date is today or in the past -> In Progress
            // If it was overdue before, moving to In Progress
            if (currentTask && currentTask.status === 'Overdue') {
              updateData.status = 'In Progress'
            } else if (!updateData.status) {
              // Only set if status wasn't explicitly provided
              updateData.status = currentTask?.status === 'Not Started' && newStartDate && newStartDate <= today 
                ? 'In Progress' 
                : (currentTask?.status || 'In Progress')
            }
          }
        }
      }
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    console.log('DELETE request received')
    console.log('Request URL:', request.url)
    
    const supabase = await createClient()
    
    // Handle both sync and async params for compatibility
    let id: string
    try {
      const params = await context.params
      id = params.id
      console.log('Resolved params:', params)
    } catch (error) {
      console.log('Async params failed, trying sync approach')
      // Fallback: extract ID from URL
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      id = pathParts[pathParts.length - 1]
      console.log('Extracted ID from URL:', id)
    }
    
    console.log('Final ID:', id)

    if (!id || id === 'undefined' || id === 'null') {
      console.error('No valid ID found')
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    console.log(`Attempting to delete task with ID: ${id}`)

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Task deleted successfully. Deleted rows: ${data?.length || 0}`)
    return NextResponse.json({ success: true, deletedCount: data?.length || 0 })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
