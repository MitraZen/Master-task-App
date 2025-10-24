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
      .eq('is_archived', false) // Only show non-archived tasks by default

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
    console.log('POST /api/tasks - Task creation request received')
    const supabase = await createClient()
    const body: CreateTaskData = await request.json()
    
    console.log('Task data received:', body)

    // Validate required fields
    if (!body.task_description || !body.start_date || !body.due_date || !body.project) {
      console.error('Missing required fields:', { task_description: !!body.task_description, start_date: !!body.start_date, due_date: !!body.due_date, project: !!body.project })
      return NextResponse.json(
        { error: 'Missing required fields: task_description, start_date, due_date, project' },
        { status: 400 }
      )
    }

    // Get the next task number for this project
    let nextTaskNo: number
    
    try {
      const { data: taskNoData, error: taskNoError } = await supabase
        .rpc('get_next_task_no', { project_name: body.project })

      if (taskNoError) {
        console.error('RPC function failed, using fallback:', taskNoError)
        // Fallback: get the highest task_no for this project and increment
        const { data: maxTaskData, error: maxError } = await supabase
          .from('tasks')
          .select('task_no')
          .eq('project', body.project)
          .order('task_no', { ascending: false })
          .limit(1)
          .single()
        
        if (maxError && maxError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Fallback query failed:', maxError)
          return NextResponse.json({ error: `Failed to get task number: ${maxError.message}` }, { status: 500 })
        }
        
        nextTaskNo = maxTaskData ? maxTaskData.task_no + 1 : 1
        console.log('Using fallback task number:', nextTaskNo)
      } else {
        nextTaskNo = taskNoData
        console.log('RPC task number:', nextTaskNo)
      }
    } catch (error) {
      console.error('Task number generation failed:', error)
      return NextResponse.json({ error: 'Failed to generate task number' }, { status: 500 })
    }

    // Create the task with the project-specific task number
    const taskData = {
      ...body,
      task_no: nextTaskNo
    }
    
    console.log('Final task data to insert:', taskData)

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('Task created successfully:', task)
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
