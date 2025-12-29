import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  console.log('🔍 [API] /api/stylists/[id] called for ID:', id, 'at:', new Date().toISOString())

  if (!id) {
    return NextResponse.json(
      { error: 'Stylist ID is required', data: null },
      { status: 400 }
    )
  }

  try {
    console.log('🔍 [API] Attempting to fetch stylist by ID from server-side...')

    // Don't filter by is_active here - let the frontend decide what to show
    const { data: stylist, error } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.log('❌ [API] Error fetching stylist by ID:', error)
      // PGRST116 is the "no rows found" error from PostgREST
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Stylist not found', data: null, success: false },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message, data: null, success: false },
        { status: 500 }
      )
    }

    if (!stylist) {
      console.log('❌ [API] Stylist not found for ID:', id)
      return NextResponse.json(
        { error: 'Stylist not found', data: null, success: false },
        { status: 404 }
      )
    }

    // Fetch reviews to calculate actual stats
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('stylist_id', id)

    if (reviewsError) {
      console.log('❌ [API] Error fetching reviews:', reviewsError)
    }

    // Calculate review stats
    const reviewCount = reviews?.length || 0
    const averageRating = reviewCount > 0
      ? Number((reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0

    const data = {
      ...stylist,
      review_count: reviewCount,
      average_rating: averageRating
    }

    console.log('✅ [API] Successfully fetched stylist:', data.business_name, 'for ID:', id, 'reviews:', reviewCount)

    return NextResponse.json({
      data,
      success: true,
      fetchedAt: new Date().toISOString()
    })

  } catch (err) {
    console.log('❌ [API] Unexpected error fetching stylist by ID:', err)
    return NextResponse.json(
      { error: 'Failed to fetch stylist', data: null },
      { status: 500 }
    )
  }
}