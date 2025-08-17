import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  
  console.log('🔍 [API] /api/stylists/profile/[userId] GET called for userId:', userId)
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required', data: null },
      { status: 400 }
    )
  }
  
  try {
    console.log('🔍 [API] Attempting to fetch stylist profile by user_id...')
    
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.log('❌ [API] Error fetching stylist profile by user_id:', error)
      return NextResponse.json(
        { error: error.message, data: null },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }

    if (!data) {
      console.log('❌ [API] Stylist profile not found for user_id:', userId)
      return NextResponse.json(
        { error: 'Stylist profile not found', data: null },
        { status: 404 }
      )
    }

    console.log('✅ [API] Successfully fetched stylist profile:', data.business_name, 'for user_id:', userId)
    
    return NextResponse.json({
      data,
      success: true,
      fetchedAt: new Date().toISOString()
    })
    
  } catch (err) {
    console.log('❌ [API] Unexpected error fetching stylist profile by user_id:', err)
    return NextResponse.json(
      { error: 'Failed to fetch stylist profile', data: null },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  
  console.log('🔍 [API] /api/stylists/profile/[userId] PUT called for userId:', userId)
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required', data: null },
      { status: 400 }
    )
  }
  
  try {
    const updates = await request.json()
    console.log('🔍 [API] Attempting to update stylist profile with:', JSON.stringify(updates, null, 2))
    
    // First, let's check the current state before update
    const { data: beforeData, error: beforeError } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (beforeError) {
      console.log('❌ [API] Could not fetch current data before update:', beforeError)
    } else {
      console.log('📊 [API] Current data before update:', JSON.stringify(beforeData, null, 2))
    }
    
    const { data, error } = await supabase
      .from('stylist_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.log('❌ [API] Error updating stylist profile:', error)
      console.log('❌ [API] Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: error.message, data: null },
        { status: 500 }
      )
    }

    if (!data) {
      console.log('❌ [API] No data returned after update for user_id:', userId)
      return NextResponse.json(
        { error: 'Update failed - no data returned', data: null },
        { status: 500 }
      )
    }

    console.log('✅ [API] Successfully updated stylist profile for user_id:', userId)
    console.log('📊 [API] Updated data:', JSON.stringify(data, null, 2))
    
    // Let's also verify the update by fetching again
    const { data: verifyData, error: verifyError } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (verifyError) {
      console.log('❌ [API] Could not verify update:', verifyError)
    } else {
      console.log('🔍 [API] Verification fetch after update:', JSON.stringify(verifyData, null, 2))
    }
    
    return NextResponse.json({
      data,
      success: true,
      updatedAt: new Date().toISOString()
    })
    
  } catch (err) {
    console.log('❌ [API] Unexpected error updating stylist profile:', err)
    return NextResponse.json(
      { error: 'Failed to update stylist profile', data: null },
      { status: 500 }
    )
  }
}