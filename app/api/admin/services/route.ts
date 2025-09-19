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
    const { stylist_id, services } = body

    console.log('🔍 [ADMIN API] Creating services for stylist:', stylist_id)
    console.log('🔍 [ADMIN API] Services to create:', services)

    if (!stylist_id || !services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: 'stylist_id and services array are required' },
        { status: 400 }
      )
    }

    // Create admin client at runtime
    const supabaseAdmin = createSupabaseAdmin()

    // Insert services using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('services')
      .insert(services.map(service => ({
        stylist_id,
        name: service.name,
        price: Math.round(service.price * 100), // convert to pence
        duration: service.duration,
        image_url: service.image_url || null
      })))
      .select()

    if (error) {
      console.error('🔍 [ADMIN API] Error creating services:', error)
      return NextResponse.json(
        { error: 'Failed to create services', details: error },
        { status: 500 }
      )
    }

    console.log('🔍 [ADMIN API] Services created successfully:', data)
    return NextResponse.json({ success: true, services: data })

  } catch (error) {
    console.error('🔍 [ADMIN API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}