import { supabase } from '@/lib/supabase'

/**
 * Recalculates and updates the average rating and review count for a stylist
 * This should be called whenever a review is added, updated, or deleted
 */
export async function updateStylistRating(stylistId: string): Promise<void> {
  try {
    console.log('🔄 [RATING] Recalculating rating for stylist:', stylistId)
    
    // Get all reviews for this stylist to calculate new average
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('stylist_id', stylistId)

    if (reviewsError) {
      console.error('❌ [RATING] Error fetching reviews:', reviewsError)
      throw reviewsError
    }

    const reviewCount = reviews?.length || 0
    const averageRating = reviewCount > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
      : 0

    console.log('📊 [RATING] Calculated stats:', {
      stylistId,
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
    })

    // Update the stylist profile with new rating statistics
    const { error: updateError } = await supabase
      .from('stylist_profiles')
      .update({
        average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        review_count: reviewCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', stylistId)

    if (updateError) {
      console.error('❌ [RATING] Error updating stylist rating:', updateError)
      throw updateError
    }

    console.log('✅ [RATING] Successfully updated rating for stylist:', stylistId)
    
  } catch (error) {
    console.error('❌ [RATING] Failed to update stylist rating:', error)
    throw error
  }
}