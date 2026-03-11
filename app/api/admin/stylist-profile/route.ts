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
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    // Update profile using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('stylist_profiles')
      .update(profile)
      .eq('id', id)
      .select()

    if (error) {
      console.error('🔍 [ADMIN API] Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update stylist profile', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      // Diagnose: does the row exist at all?
      const { data: existing } = await supabaseAdmin
        .from('stylist_profiles')
        .select('id')
        .eq('id', id)
        .limit(1)

      if (!existing || existing.length === 0) {
        console.error('🔍 [ADMIN API] Profile not found:', id, '| service key set:', hasServiceKey)
        return NextResponse.json(
          { error: `Profile with id "${id}" not found` },
          { status: 404 }
        )
      }

      // Row exists but update returned nothing — RLS is blocking the update
      console.error('🔍 [ADMIN API] Update blocked (likely RLS). id:', id, '| service key set:', hasServiceKey)
      return NextResponse.json(
        { error: hasServiceKey
            ? 'Update failed — the profile exists but could not be updated. Check server logs.'
            : 'Update failed — SUPABASE_SERVICE_ROLE_KEY is not set. The admin API cannot bypass RLS without it.'
        },
        { status: 403 }
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('id')

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile id is required' },
        { status: 400 }
      )
    }

    console.log('🔍 [ADMIN API] Deleting stylist profile and all related data:', profileId)

    const supabaseAdmin = createSupabaseAdmin()

    // 1. Get the profile to find the user_id before deleting
    const { data: profileRows, error: fetchError } = await supabaseAdmin
      .from('stylist_profiles')
      .select('user_id')
      .eq('id', profileId)
      .limit(1)

    if (fetchError) {
      console.error('🔍 [ADMIN API] Error fetching profile:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: fetchError },
        { status: 500 }
      )
    }

    const userId = profileRows?.[0]?.user_id

    // 2. Delete related records (order matters due to foreign keys)
    const { error: servicesError } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('stylist_id', profileId)

    if (servicesError) {
      console.error('🔍 [ADMIN API] Error deleting services:', servicesError)
    }

    const { error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('stylist_id', profileId)

    if (reviewsError) {
      console.error('🔍 [ADMIN API] Error deleting reviews:', reviewsError)
    }

    const { error: savedError } = await supabaseAdmin
      .from('saved_stylists')
      .delete()
      .eq('stylist_id', profileId)

    if (savedError) {
      console.error('🔍 [ADMIN API] Error deleting saved_stylists:', savedError)
    }

    // 3. Delete the stylist profile itself
    const { error: profileError } = await supabaseAdmin
      .from('stylist_profiles')
      .delete()
      .eq('id', profileId)

    if (profileError) {
      console.error('🔍 [ADMIN API] Error deleting profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete stylist profile', details: profileError },
        { status: 500 }
      )
    }

    // 4. Delete the users table entry and auth user (if user_id exists)
    if (userId) {
      const { error: usersError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId)

      if (usersError) {
        console.error('🔍 [ADMIN API] Error deleting users entry:', usersError)
      }

      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (authError) {
        console.error('🔍 [ADMIN API] Error deleting auth user:', authError)
      }
    }

    console.log('🔍 [ADMIN API] Stylist and all related data deleted successfully:', profileId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('🔍 [ADMIN API] Unexpected error during delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
