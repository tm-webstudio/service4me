import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import ClaimAccountEmail from '@/lib/email/claim-account-email'

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

    if (!email || !stylist_id) {
      return NextResponse.json(
        { error: 'Email and stylist_id are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createSupabaseAdmin()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://service4me.co.uk'

    // Generate a new recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/confirm`,
      }
    })

    if (linkError) {
      console.error('Error generating recovery link:', linkError)
      return NextResponse.json(
        { error: 'Failed to generate claim link' },
        { status: 500 }
      )
    }

    const claimUrl = `${siteUrl}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=recovery`

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(resendApiKey)

    const emailHtml = await render(ClaimAccountEmail({
      businessName: business_name,
      claimUrl,
    }))

    const { error: emailError } = await resend.emails.send({
      from: 'Service4Me <admin@updates.service4me.co.uk>',
      to: email,
      subject: `${business_name}, your account is ready to claim`,
      html: emailHtml,
    })

    if (emailError) {
      console.error('Error sending claim email:', JSON.stringify(emailError))
      return NextResponse.json(
        { error: `Failed to send claim email: ${emailError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      email_sent: true,
      message: 'Claim email resent successfully'
    })

  } catch (error) {
    console.error('Error in resend-claim API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
