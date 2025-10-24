import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { Task, CreateTaskData, UpdateTaskData } from '@/types/task'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters for filtering and sorting
    const priority = searchParams.get('priority')
    const status = searchParams.get('status')
    const frequency = searchParams.get('frequency')
    const stageGates = searchParams.get('stage_gates')
    const taskType = searchParams.get('task_type')
    const assignedTo = searchParams.get('assigned_to')
    const sortBy = searchParams.get('sortBy') || 'due_date'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    let query = supabase
      .from('tasks')
      .select('*')

    // Apply filters
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (frequency) {
      query = query.eq('frequency', frequency)
    }
    if (stageGates) {
      query = query.eq('stage_gates', stageGates)
    }
    if (taskType) {
      query = query.eq('task_type', taskType)
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateTaskData = await request.json()

    // Validate required fields
    if (!body.task_description || !body.start_date || !body.due_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
