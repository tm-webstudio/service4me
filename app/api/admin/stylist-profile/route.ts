import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client for admin operations
function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || (!serviceKey && !anonKey)) {
    throw new Error('Missing required Supabase configuration')
  }

  return createClient(url, serviceKey || anonKey!)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile } = body

    console.log('🔍 [ADMIN API] Creating stylist profile:', profile.business_name)

    if (!profile) {
      return NextResponse.json(
        { error: 'profile data is required' },
        { status: 400 }
      )
    }

    // Create admin client at runtime
    const supabaseAdmin = createSupabaseAdmin()

    // Insert profile using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('stylist_profiles')
      .insert([profile])
      .select()

    if (error) {
      console.error('🔍 [ADMIN API] Error creating profile:', error)
      return NextResponse.json(
        { error: 'Failed to create stylist profile', details: error },
        { status: 500 }
      )
    }

    console.log('🔍 [ADMIN API] Profile created successfully:', data[0].id)
    return NextResponse.json({ success: true, profile: data[0] })

  } catch (error) {
    console.error('🔍 [ADMIN API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, profile } = body

    console.log('🔍 [ADMIN API] Updating stylist profile:', id)

    if (!id || !profile) {
      return NextResponse.json(
        { error: 'id and profile data are required' },
        { status: 400 }
      )
    }

    // Create admin client at runtime
    const supabaseAdmin = createSupabaseAdmin()

    // Update profile using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('stylist_profiles')
      .update(profile)
      .eq('id', id)
      .select()

    if (error) {
      console.error('🔍 [ADMIN API] Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update stylist profile', details: error },
        { status: 500 }
      )
    }

    console.log('🔍 [ADMIN API] Profile updated successfully:', data[0].id)
    return NextResponse.json({ success: true, profile: data[0] })

  } catch (error) {
    console.error('🔍 [ADMIN API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
