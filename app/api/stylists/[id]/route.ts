import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  console.log('🔍 [API] /api/stylists/[id] called for ID:', id, 'at:', new Date().toISOString())
  
  if (!id) {
    return NextResponse.json(
      { error: 'Stylist ID is required', data: null },
      { status: 400 }
    )
  }
  
  try {
    console.log('🔍 [API] Attempting to fetch stylist by ID from server-side...')
    
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.log('❌ [API] Error fetching stylist by ID:', error)
      return NextResponse.json(
        { error: error.message, data: null },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    if (!data) {
      console.log('❌ [API] Stylist not found for ID:', id)
      return NextResponse.json(
        { error: 'Stylist not found', data: null },
        { status: 404 }
      )
    }

    console.log('✅ [API] Successfully fetched stylist:', data.business_name, 'for ID:', id)
    
    return NextResponse.json({
      data,
      success: true,
      fetchedAt: new Date().toISOString()
    })
    
  } catch (err) {
    console.log('❌ [API] Unexpected error fetching stylist by ID:', err)
    return NextResponse.json(
      { error: 'Failed to fetch stylist', data: null },
      { status: 500 }
    )
  }
}