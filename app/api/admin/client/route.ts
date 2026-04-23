import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || (!serviceKey && !anonKey)) {
    throw new Error('Missing required Supabase configuration')
  }

  return createClient(url, serviceKey || anonKey!)
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('id')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client id is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createSupabaseAdmin()

    // 1. Delete saved_stylists records for this client
    const { error: savedError } = await supabaseAdmin
      .from('saved_stylists')
      .delete()
      .eq('client_id', clientId)

    if (savedError) {
      console.error('[ADMIN API] Error deleting saved_stylists:', savedError)
    }

    // 2. Delete reviews by this client
    const { error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('client_id', clientId)

    if (reviewsError) {
      console.error('[ADMIN API] Error deleting reviews:', reviewsError)
    }

    // 3. Delete the users table entry
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', clientId)

    if (usersError) {
      console.error('[ADMIN API] Error deleting users entry:', usersError)
      return NextResponse.json(
        { error: 'Failed to delete client', details: usersError },
        { status: 500 }
      )
    }

    // 4. Delete the auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(clientId)

    if (authError) {
      console.error('[ADMIN API] Error deleting auth user:', authError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[ADMIN API] Unexpected error during client delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
