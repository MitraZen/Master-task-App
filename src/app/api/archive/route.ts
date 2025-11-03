import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// GET /api/archive - Get all archived tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const sortBy = searchParams.get('sortBy') || 'archived_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Explicitly filter for archived tasks only
    // Shows all archived tasks (completed or not)
    // Ensure is_archived is exactly true and archived_at is not null
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_archived', true)
      .not('archived_at', 'is', null) // Ensure archived_at is not null
      .order(sortBy, { ascending: sortOrder === 'asc' })

    if (error) {
      console.error('Error fetching archived tasks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Additional client-side filter as a safety measure
    // Only show tasks that are archived and have an archived_at date
    const archivedTasks = (tasks || []).filter(task => 
      task.is_archived === true && 
      task.archived_at !== null
    )

    return NextResponse.json({ tasks: archivedTasks })
  } catch (error) {
    console.error('Archive GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/archive - Archive a task (soft delete)
// Allows archiving any task (completed or not), but warns for non-completed tasks
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Archive the task (allows any task to be archived)
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ 
        is_archived: true, 
        archived_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .eq('is_archived', false) // Only archive non-archived tasks
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

// PUT /api/archive - Restore archived task
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ 
        is_archived: false, 
        archived_at: null 
      })
      .eq('id', taskId)
      .eq('is_archived', true) // Only restore archived tasks
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

// DELETE /api/archive - Permanently delete archived task
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('is_archived', true) // Only delete archived tasks
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deletedCount: data?.length || 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

