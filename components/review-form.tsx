"use client"

import { useState } from "react"
import { StarRating } from "@/components/ui/star-rating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { updateStylistRating } from "@/lib/rating-utils"

interface ReviewFormProps {
  stylistId: string
  existingReview?: {
    id: string
    rating: number
    comment: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ 
  stylistId, 
  existingReview, 
  onSuccess, 
  onCancel 
}: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isEditing = !!existingReview
  const maxCommentLength = 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError("You must be logged in to leave a review")
      return
    }

    if (user.role !== 'client') {
      setError("Only clients can leave reviews")
      return
    }

    if (rating === 0) {
      setError("Please select a star rating")
      return
    }

    if (comment.trim().length > maxCommentLength) {
      setError(`Comment must be ${maxCommentLength} characters or less`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const reviewData = {
        stylist_id: stylistId,
        client_id: user.id,
        rating,
        comment: comment.trim() || null,
        updated_at: new Date().toISOString()
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', existingReview.id)

        if (updateError) {
          throw updateError
        }
      } else {
        const { error: insertError } = await supabase
          .from('reviews')
          .insert([{
            ...reviewData,
            created_at: new Date().toISOString()
          }])

        if (insertError) {
          throw insertError
        }
      }

      // Recalculate stylist rating statistics
      await updateStylistRating(stylistId)

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 1500)

    } catch (err: any) {
      if (err.code === '23505') {
        setError("You have already reviewed this stylist. You can only submit one review per stylist.")
      } else if (err.code === 'PGRST301' || err.message?.includes('permission denied')) {
        setError("You don't have permission to perform this action. Make sure you're logged in as a client.")
      } else {
        setError(err.message || 'Failed to submit review. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to leave a review.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (user.role !== 'client') {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only clients can leave reviews.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {isEditing ? 'Review updated successfully!' : 'Review submitted successfully!'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Your Review' : 'Leave a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Rating *
            </label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              readonly={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Comment (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this stylist..."
              rows={4}
              maxLength={maxCommentLength}
              disabled={loading}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/{maxCommentLength} characters
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}