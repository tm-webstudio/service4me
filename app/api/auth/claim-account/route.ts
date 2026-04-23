import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing required Supabase configuration')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, access_token } = body

    if (!password || !access_token) {
      return NextResponse.json(
        { error: 'Password and access token are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createSupabaseAdmin()

    // Verify the access token and get the user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(access_token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Update the password via admin API (bypasses client-side auth state issues)
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    })

    if (passwordError) {
      return NextResponse.json(
        { error: passwordError.message },
        { status: 500 }
      )
    }

    // Mark account as claimed (using admin client bypasses RLS)
    const stylistId = user.user_metadata?.stylist_id
    if (stylistId) {
      await supabaseAdmin
        .from('stylist_profiles')
        .update({ account_claimed: true })
        .eq('id', stylistId)
    } else {
      await supabaseAdmin
        .from('stylist_profiles')
        .update({ account_claimed: true })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in claim-account API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
