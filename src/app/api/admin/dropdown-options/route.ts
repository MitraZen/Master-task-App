import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { DropdownOption } from '@/types/task'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const fieldName = searchParams.get('field_name')

    let query = supabase
      .from('dropdown_options')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (fieldName) {
      query = query.eq('field_name', fieldName)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching dropdown options:', error)
      return NextResponse.json({ error: 'Failed to fetch dropdown options' }, { status: 500 })
    }

    return NextResponse.json({ options: data || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/dropdown-options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { field_name, option_value, option_label, sort_order } = body

    if (!field_name || !option_value || !option_label) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('dropdown_options')
      .insert({
        field_name,
        option_value,
        option_label,
        sort_order: sort_order || 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating dropdown option:', error)
      return NextResponse.json({ error: 'Failed to create dropdown option' }, { status: 500 })
    }

    return NextResponse.json({ option: data })
  } catch (error) {
    console.error('Error in POST /api/admin/dropdown-options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, field_name, option_value, option_label, sort_order, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 })
    }

    const updateData: Partial<DropdownOption> = {}
    if (field_name !== undefined) updateData.field_name = field_name
    if (option_value !== undefined) updateData.option_value = option_value
    if (option_label !== undefined) updateData.option_label = option_label
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from('dropdown_options')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating dropdown option:', error)
      return NextResponse.json({ error: 'Failed to update dropdown option' }, { status: 500 })
    }

    return NextResponse.json({ option: data })
  } catch (error) {
    console.error('Error in PUT /api/admin/dropdown-options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('dropdown_options')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting dropdown option:', error)
      return NextResponse.json({ error: 'Failed to delete dropdown option' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/dropdown-options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
