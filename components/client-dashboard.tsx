"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StarDisplay } from "@/components/ui/star-rating"
import { ReviewForm } from "@/components/review-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Calendar,
  Star,
  Edit2,
  Trash2,
  MessageSquare,
  Loader2,
  AlertCircle,
  LayoutDashboard
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"

interface ClientReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  stylist_id: string
  stylist_business_name: string
}

export function ClientDashboard() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const [reviews, setReviews] = useState<ClientReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<ClientReview | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchClientReviews = async () => {
    if (!userProfile?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          updated_at,
          stylist_id,
          stylist:stylist_id (
            business_name
          )
        `)
        .eq('client_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const transformedReviews: ClientReview[] = (data || []).map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
        stylist_id: review.stylist_id,
        stylist_business_name: Array.isArray(review.stylist) ? review.stylist[0]?.business_name : review.stylist?.business_name || 'Unknown Stylist'
      }))

      setReviews(transformedReviews)

    } catch (err: any) {
      console.error('Failed to fetch client reviews:', err)
      setError('Failed to load your reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
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

      // Refresh reviews
      setRefreshTrigger(prev => prev + 1)

    } catch (err: any) {
      console.error('Failed to delete review:', err)
      alert('Failed to delete review. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getMemberSince = () => {
    if (!userProfile?.created_at) return 'Recently'
    
    try {
      const date = new Date(userProfile.created_at)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    } catch {
      return 'Recently'
    }
  }

  useEffect(() => {
    if (userProfile?.id) {
      fetchClientReviews()
    }
  }, [userProfile?.id, refreshTrigger])

  // Show loading state
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  // User is authenticated and is a client - show dashboard

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg px-4 py-4 sm:px-6 sm:py-8 mb-6 sm:mb-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
            Client Dashboard
          </p>
          <h1 className="text-xl sm:text-3xl font-medium text-gray-900">
            Welcome back, {userProfile?.full_name || 'Client'}!
          </h1>
          <p className="text-sm sm:text-base text-blue-700/80 mt-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Member since {getMemberSince()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 p-0 h-auto gap-4 sm:gap-6 flex-nowrap overflow-x-auto whitespace-nowrap justify-start rounded-none w-full -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger
            value="dashboard"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            My Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-xl">Overview</CardTitle>
              <CardDescription>Your activity and account summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="bg-indigo-600 p-3 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 mt-6">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start by booking a service and leaving your first review!
                  </p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/browse")}
                  >
                    Browse Stylists
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <Card key={review.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4
                                className="font-semibold text-gray-900 hover:underline cursor-pointer mb-2"
                                onClick={() => router.push(`/stylist/${review.stylist_id}`)}
                              >
                                {review.stylist_business_name}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <StarDisplay rating={review.rating} size="sm" showCount={false} />
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {/* Edit Review Form */}
          {editingReview && (
            <div className="mb-6">
              <ReviewForm
                stylistId={editingReview.stylist_id}
                existingReview={{
                  id: editingReview.id,
                  rating: editingReview.rating,
                  comment: editingReview.comment || ""
                }}
                onSuccess={() => {
                  setEditingReview(null)
                  setRefreshTrigger(prev => prev + 1)
                }}
                onCancel={() => setEditingReview(null)}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-xl">
                    My Reviews
                  </CardTitle>
                  <CardDescription>All your reviews and feedback</CardDescription>
                </div>
                <Badge variant="outline">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500 mb-4">
                Start by booking a service and leaving your first review!
              </p>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => router.push("/browse")}
              >
                Browse Stylists
              </Button>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 
                            className="font-semibold text-lg text-gray-900 hover:underline cursor-pointer"
                            onClick={() => router.push(`/stylist/${review.stylist_id}`)}
                          >
                            {review.stylist_business_name}
                          </h3>
                          {review.updated_at !== review.created_at && (
                            <Badge variant="outline" className="text-xs">
                              edited
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <StarDisplay
                            rating={review.rating}
                            size="sm"
                            showCount={false}
                          />
                          <span className="text-sm text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>

                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReview(review)}
                          disabled={!!editingReview}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
