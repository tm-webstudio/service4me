"use client"

import { useState, useEffect } from "react"
import { StarDisplay } from "@/components/ui/star-rating"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Edit2,
  Trash2,
  AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { formatDistanceToNow } from "date-fns"
import { updateStylistRating } from "@/lib/rating-utils"

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  client_id: string
  client_name: string
  client_avatar?: string
}

interface ReviewsDisplayProps {
  stylistId: string
  onEditReview?: (review: Review) => void
  refreshTrigger?: number
  onReviewDeleted?: () => void
}

const REVIEWS_PER_PAGE = 6

export function ReviewsDisplay({ 
  stylistId, 
  onEditReview,
  refreshTrigger,
  onReviewDeleted
}: ReviewsDisplayProps) {
  const { userProfile } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE)
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get total count
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('stylist_id', stylistId)

      setTotalReviews(count || 0)

      // Get paginated reviews with client information
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          updated_at,
          client_id,
          client:client_id (
            full_name,
            avatar_url
          )
        `)
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + REVIEWS_PER_PAGE - 1)

      if (error) {
        throw error
      }

      const transformedReviews: Review[] = (data || []).map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
        client_id: review.client_id,
        client_name: Array.isArray(review.client) ? review.client[0]?.full_name : review.client?.full_name || 'Anonymous',
        client_avatar: Array.isArray(review.client) ? review.client[0]?.avatar_url : review.client?.avatar_url
      }))

      setReviews(transformedReviews)

    } catch (err: any) {
      console.error('Failed to fetch reviews:', err)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return
    }

    setDeletingId(reviewId)
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('client_id', userProfile?.id) // Ensure user can only delete their own review

      if (error) {
        throw error
      }

      // Recalculate stylist rating statistics
      await updateStylistRating(stylistId)

      // Refresh reviews
      await fetchReviews()
      
      // If we deleted the last review on a page, go to previous page
      if (reviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }

      // Notify parent component that a review was deleted
      onReviewDeleted?.()

    } catch (err: any) {
      console.error('Failed to delete review:', err)
      alert('Failed to delete review. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [stylistId, currentPage, refreshTrigger])

  const getClientInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const canEditReview = (review: Review) => {
    return userProfile?.id === review.client_id && userProfile?.role === 'client'
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (totalReviews === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Be the first to leave a review for this stylist!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <Card key={review.id} className="h-fit">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.client_avatar} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                      {getClientInitials(review.client_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.client_name}
                    </h4>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                      {review.updated_at !== review.created_at && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          edited
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {canEditReview(review) && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditReview?.(review)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingId === review.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === review.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <StarDisplay
                rating={review.rating}
                size="sm"
                showCount={false}
                className="mb-3"
              />

              {review.comment && (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {review.comment}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + REVIEWS_PER_PAGE, totalReviews)} of {totalReviews} reviews
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}