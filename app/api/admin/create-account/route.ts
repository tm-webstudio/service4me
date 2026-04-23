import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import ClaimAccountEmail from '@/lib/email/claim-account-email'

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
    const { email, stylist_id, business_name } = body

    // Validate required fields
    if (!email || !stylist_id) {
      return NextResponse.json(
        { error: 'Email and stylist_id are required' },
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

    // Verify the stylist profile exists and check its current state
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

    if (existingProfile.user_id) {
      return NextResponse.json(
        { error: 'This stylist profile already has a user account linked' },
        { status: 400 }
      )
    }

    // Generate a random password (the stylist will set their own via the claim link)
    const tempPassword = crypto.randomUUID()

    // Create user account with Supabase Admin
    let authData: any
    const { data: initialAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'stylist',
        stylist_id: stylist_id,
        business_name: business_name
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)

      // Handle duplicate email by cleaning up orphaned account
      if (authError.message?.includes('already been registered') || authError.message?.includes('email_address_not_authorized')) {
        console.log('Email already exists, attempting to clean up orphaned account...')
        try {
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
          const orphanedUser = existingUsers.users?.find(u => u.email === email)

          if (orphanedUser) {
            await supabaseAdmin.auth.admin.deleteUser(orphanedUser.id)

            const { data: retryAuthData, error: retryAuthError } = await supabaseAdmin.auth.admin.createUser({
              email,
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                role: 'stylist',
                stylist_id: stylist_id,
                business_name: existingProfile.business_name
              }
            })

            if (retryAuthError) throw retryAuthError
            authData = retryAuthData
          } else {
            throw new Error('Email is registered but user not found in admin list')
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup orphaned account:', cleanupError)
          return NextResponse.json(
            { error: 'Email address is already registered. Please use a different email address or contact support.' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: `Failed to create user account: ${authError.message}` },
          { status: 500 }
        )
      }
    } else {
      authData = initialAuthData
    }

    if (!authData?.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user data returned' },
        { status: 500 }
      )
    }

    console.log('User created successfully:', authData.user.id)

    // Create or update user profile record in users table
    // First check if a row with this email already exists (e.g. orphaned from a previous account)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', authData.user.email)
      .limit(1)
      .maybeSingle()

    if (existingUser) {
      // Update the existing row to point to the new auth user
      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update({
          id: authData.user.id,
          full_name: existingProfile.business_name,
          role: 'stylist'
        })
        .eq('email', authData.user.email)

      if (updateUserError) {
        console.error('Error updating existing user profile:', updateUserError)
        // If update fails due to id conflict, delete the old row and insert fresh
        await supabaseAdmin.from('users').delete().eq('id', existingUser.id)
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: existingProfile.business_name,
            role: 'stylist'
          })
        if (insertError) {
          console.error('Error creating user profile after cleanup:', insertError)
          return NextResponse.json(
            { error: `Failed to create user profile: ${insertError.message}` },
            { status: 500 }
          )
        }
      }
    } else {
      const { error: userProfileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: existingProfile.business_name,
          role: 'stylist'
        })

      if (userProfileError) {
        console.error('Error creating user profile:', userProfileError)
        return NextResponse.json(
          { error: `Failed to create user profile: ${userProfileError.message}` },
          { status: 500 }
        )
      }
    }

    // Clean up any trigger-created default profiles
    const { data: triggerCreatedProfiles } = await supabaseAdmin
      .from('stylist_profiles')
      .select('id, business_name')
      .eq('user_id', authData.user.id)

    if (triggerCreatedProfiles) {
      for (const triggerProfile of triggerCreatedProfiles) {
        if (triggerProfile.business_name === 'My Hair Studio') {
          await supabaseAdmin
            .from('stylist_profiles')
            .delete()
            .eq('id', triggerProfile.id)
        }
      }
    }

    // Link the existing stylist profile to the user account
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
    }

    // Generate a password reset link for the "Claim Your Account" email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://service4me.co.uk'

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/confirm`,
      }
    })

    if (linkError) {
      console.error('Error generating recovery link:', linkError)
      // Account was created successfully, but email will fail — return partial success
      return NextResponse.json({
        success: true,
        user_id: authData.user.id,
        email: authData.user.email,
        email_sent: false,
        message: 'Account created but failed to generate claim link. You can manually share login details.'
      })
    }

    // Build the claim URL from the generated link token
    const claimUrl = `${siteUrl}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=recovery`

    // Send the claim email via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json({
        success: true,
        user_id: authData.user.id,
        email: authData.user.email,
        email_sent: false,
        message: 'Account created but email service is not configured.'
      })
    }

    const resend = new Resend(resendApiKey)

    const emailHtml = await render(ClaimAccountEmail({
      businessName: existingProfile.business_name,
      claimUrl,
    }))

    const { error: emailError } = await resend.emails.send({
      from: 'Service4Me <admin@updates.service4me.co.uk>',
      to: email,
      subject: `${existingProfile.business_name}, your Service4Me account is ready to claim`,
      html: emailHtml,
    })

    if (emailError) {
      console.error('Error sending claim email:', JSON.stringify(emailError))
      return NextResponse.json({
        success: true,
        user_id: authData.user.id,
        email: authData.user.email,
        email_sent: false,
        message: `Account created but failed to send claim email: ${emailError.message}`
      })
    }

    console.log('Claim email sent successfully to:', email)

    return NextResponse.json({
      success: true,
      user_id: authData.user.id,
      email: authData.user.email,
      email_sent: true,
      message: 'Account created and claim email sent successfully'
    })

  } catch (error) {
    console.error('Error in create-account API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
