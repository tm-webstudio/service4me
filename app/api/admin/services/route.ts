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
        duration: service.duration || 60,
        description: service.description || null,
        image_url: service.image_url || null,
        options: service.options
          ? service.options.map((opt: any) => ({
              ...opt,
              price: Math.round(opt.price * 100)
            }))
          : null
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { stylist_id, services } = body

    console.log('🔍 [ADMIN API] Syncing services for stylist:', stylist_id)

    if (!stylist_id || !services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: 'stylist_id and services array are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createSupabaseAdmin()

    // Fetch existing services for this stylist
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('id, name, price, duration, description, image_url, options')
      .eq('stylist_id', stylist_id)

    if (fetchError) {
      console.error('🔍 [ADMIN API] Error fetching existing services:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch existing services', details: fetchError },
        { status: 500 }
      )
    }

    const existingIds = new Set((existing || []).map(s => s.id))
    const incomingIds = new Set(services.filter(s => s.id).map(s => s.id))

    // Delete removed services
    const toDelete = [...existingIds].filter(id => !incomingIds.has(id))
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('services')
        .delete()
        .in('id', toDelete)

      if (deleteError) {
        console.error('🔍 [ADMIN API] Error deleting services:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete removed services', details: deleteError },
          { status: 500 }
        )
      }
    }

    // Update existing and insert new services
    for (const service of services) {
      if (service.id && existingIds.has(service.id)) {
        const { error: updateError } = await supabaseAdmin
          .from('services')
          .update({
            name: service.name,
            price: Math.round(service.price * 100),
            duration: service.duration || 60,
            description: service.description || null,
            image_url: service.image_url || null,
            options: service.options
              ? service.options.map((opt: any) => ({
                  ...opt,
                  price: Math.round(opt.price * 100)
                }))
              : null
          })
          .eq('id', service.id)

        if (updateError) {
          console.error('🔍 [ADMIN API] Error updating service:', updateError)
          return NextResponse.json(
            { error: `Failed to update service "${service.name}"`, details: updateError },
            { status: 500 }
          )
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('services')
          .insert({
            stylist_id,
            name: service.name,
            price: Math.round(service.price * 100),
            duration: service.duration || 60,
            description: service.description || null,
            image_url: service.image_url || null,
            options: service.options
              ? service.options.map((opt: any) => ({
                  ...opt,
                  price: Math.round(opt.price * 100)
                }))
              : null
          })

        if (insertError) {
          console.error('🔍 [ADMIN API] Error inserting service:', insertError)
          return NextResponse.json(
            { error: `Failed to insert service "${service.name}"`, details: insertError },
            { status: 500 }
          )
        }
      }
    }

    console.log('🔍 [ADMIN API] Services synced successfully for stylist:', stylist_id)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('🔍 [ADMIN API] Unexpected error syncing services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}