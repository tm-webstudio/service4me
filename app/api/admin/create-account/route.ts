import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
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
    const { email, password, stylist_id, business_name } = body

    // Validate required fields
    if (!email || !password || !stylist_id) {
      return NextResponse.json(
        { error: 'Email, password, and stylist_id are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.log('Creating user account for:', { email, stylist_id, business_name })
    
    // Create admin client at runtime
    const supabaseAdmin = createSupabaseAdmin()
    
    // First, let's verify the stylist profile exists and check its current state
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('stylist_profiles')
      .select('id, business_name, user_id')
      .eq('id', stylist_id)
      .single()
      
    if (fetchError) {
      console.error('Error fetching stylist profile:', fetchError)
      return NextResponse.json(
        { error: 'Stylist profile not found' },
        { status: 404 }
      )
    }
    
    console.log('Found existing stylist profile:', existingProfile)
    
    if (existingProfile.user_id) {
      return NextResponse.json(
        { error: 'This stylist profile already has a user account linked' },
        { status: 400 }
      )
    }

    // Create user account with Supabase Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'stylist',
        stylist_id: stylist_id,
        business_name: business_name
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      
      // Check if it's a duplicate email error
      if (authError.message?.includes('already been registered') || authError.message?.includes('email_address_not_authorized')) {
        // Try to find and delete the existing orphaned user first
        console.log('Email already exists, attempting to clean up orphaned account...')
        try {
          // Try to get the existing user by email
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
          const orphanedUser = existingUsers.users?.find(u => u.email === email)
          
          if (orphanedUser) {
            console.log('Found orphaned user:', orphanedUser.id)
            // Delete the orphaned user
            await supabaseAdmin.auth.admin.deleteUser(orphanedUser.id)
            console.log('Deleted orphaned user, retrying account creation...')
            
            // Retry creating the user
            const { data: retryAuthData, error: retryAuthError } = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: {
                role: 'stylist',
                stylist_id: stylist_id,
                business_name: existingProfile.business_name
              }
            })
            
            if (retryAuthError) {
              throw retryAuthError
            }
            
            // Update authData for the rest of the function
            Object.assign(authData, retryAuthData)
          } else {
            throw new Error('Email is registered but user not found in admin list')
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup orphaned account:', cleanupError)
          return NextResponse.json(
            { error: `Email address is already registered. Please use a different email address or contact support to resolve this issue.` },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: `Failed to create user account: ${authError.message}` },
          { status: 500 }
        )
      }
    }

    if (!authData?.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user data returned' },
        { status: 500 }
      )
    }

    console.log('User created successfully:', authData.user.id)

    // Temporarily disable the trigger to prevent automatic stylist profile creation
    console.log('Disabling trigger before user creation')
    try {
      await supabaseAdmin.sql`ALTER TABLE users DISABLE TRIGGER trigger_create_stylist_profile`
      console.log('Trigger disabled successfully')
    } catch (triggerError) {
      console.error('Could not disable trigger:', triggerError)
      // Continue anyway
    }

    // Create user profile record in our users table
    const { error: userProfileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: existingProfile.business_name, // Use the existing profile's business name
        role: 'stylist'
      })

    // Re-enable the trigger
    console.log('Re-enabling trigger after user creation')
    try {
      await supabaseAdmin.sql`ALTER TABLE users ENABLE TRIGGER trigger_create_stylist_profile`
      console.log('Trigger re-enabled successfully')
    } catch (triggerError) {
      console.error('Could not re-enable trigger:', triggerError)
      // Continue anyway - this is not critical
    }

    if (userProfileError) {
      console.error('Error creating user profile:', userProfileError)
      return NextResponse.json(
        { error: `Failed to create user profile: ${userProfileError.message}` },
        { status: 500 }
      )
    } else {
      console.log('User profile created successfully in users table')
    }

    // Check if the trigger created a default stylist profile
    console.log('Checking if trigger created a default profile...')
    const { data: triggerCreatedProfiles, error: checkError } = await supabaseAdmin
      .from('stylist_profiles')
      .select('id, business_name')
      .eq('user_id', authData.user.id)

    if (checkError) {
      console.error('Error checking for trigger-created profiles:', checkError)
    }

    if (triggerCreatedProfiles && triggerCreatedProfiles.length > 0) {
      console.log('Found trigger-created profile(s):', triggerCreatedProfiles)
      
      // Delete the trigger-created profile(s) since we want to use the existing one
      for (const triggerProfile of triggerCreatedProfiles) {
        if (triggerProfile.business_name === 'My Hair Studio') {
          console.log('Deleting trigger-created default profile:', triggerProfile.id)
          await supabaseAdmin
            .from('stylist_profiles')
            .delete()
            .eq('id', triggerProfile.id)
        }
      }
    }

    // Now link the existing stylist profile to the user account
    console.log('Linking existing stylist profile to user account')
    const { error: updateError } = await supabaseAdmin
      .from('stylist_profiles')
      .update({ user_id: authData.user.id })
      .eq('id', stylist_id)

    if (updateError) {
      console.error('Error linking stylist profile:', updateError)
      return NextResponse.json(
        { error: `Failed to link stylist profile: ${updateError.message}` },
        { status: 500 }
      )
    } else {
      console.log('Successfully linked existing stylist profile to user account')
    }

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      email: authData.user.email,
      message: 'User account created successfully'
    })

  } catch (error) {
    console.error('Error in create-account API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}