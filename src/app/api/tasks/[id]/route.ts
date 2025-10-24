import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { UpdateTaskData } from '@/types/task'

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const body: UpdateTaskData = await request.json()
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const { id: bodyId, ...updateData } = body

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
    const params = await context.params
    console.log('Resolved params:', params)
    
    const { id } = params
    console.log('Extracted ID:', id)

    if (!id) {
      console.error('No ID found in params')
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
