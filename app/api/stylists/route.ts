import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🔍 [API] /api/stylists called at:', new Date().toISOString())

  try {
    console.log('🔍 [API] Attempting to fetch stylists from server-side...')

    // Fetch stylists with their reviews to calculate actual stats
    const { data: stylists, error: stylistsError } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (stylistsError) {
      console.log('❌ [API] Error fetching stylists:', stylistsError)
      return NextResponse.json(
        { error: stylistsError.message, data: [] },
        { status: 500 }
      )
    }

    // Fetch all reviews to calculate stats
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('stylist_id, rating')

    if (reviewsError) {
      console.log('❌ [API] Error fetching reviews:', reviewsError)
    }

    // Calculate review stats per stylist
    const reviewStats: Record<string, { count: number; total: number }> = {}
    if (reviews) {
      for (const review of reviews) {
        if (!reviewStats[review.stylist_id]) {
          reviewStats[review.stylist_id] = { count: 0, total: 0 }
        }
        reviewStats[review.stylist_id].count++
        reviewStats[review.stylist_id].total += review.rating
      }
    }

    // Merge review stats into stylist data
    const data = stylists?.map(stylist => {
      const stats = reviewStats[stylist.id]
      return {
        ...stylist,
        review_count: stats?.count || 0,
        average_rating: stats ? Number((stats.total / stats.count).toFixed(1)) : 0
      }
    })

    console.log('✅ [API] Successfully fetched', data?.length || 0, 'stylists with review stats')

    return NextResponse.json({
      data,
      success: true,
      fetchedAt: new Date().toISOString()
    })

  } catch (err) {
    console.log('❌ [API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch stylists', data: [] },
      { status: 500 }
    )
  }
}