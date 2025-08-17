import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🔍 [API] /api/stylists called at:', new Date().toISOString())
  
  try {
    console.log('🔍 [API] Attempting to fetch stylists from server-side...')
    
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('❌ [API] Error fetching stylists:', error)
      return NextResponse.json(
        { error: error.message, data: [] },
        { status: 500 }
      )
    }

    console.log('✅ [API] Successfully fetched', data?.length || 0, 'stylists')
    
    return NextResponse.json({
      data,
      success: true,
      fetchedAt: new Date().toISOString()
    })
    
  } catch (err) {
    console.log('❌ [API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch stylists', data: [] },
      { status: 500 }
    )
  }
}