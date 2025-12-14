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
  Edit2,
  Trash2,
  MessageSquare,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Mail,
  MapPin,
  Heart
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { DashboardHero } from "@/components/ui/dashboard-hero"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ClientReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  stylist_id: string
  stylist_business_name: string
}

interface SavedStylist {
  id: string
  stylist_id: string
  business_name: string
  location: string
  average_rating?: number
  review_count?: number
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
  const [savedStylists, setSavedStylists] = useState<SavedStylist[]>([])
  const [savedLoading, setSavedLoading] = useState(true)
  const [savedError, setSavedError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

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

  const fetchSavedStylists = async () => {
    if (!isSupabaseConfigured()) {
      setSavedLoading(false)
      setSavedStylists([])
      setSavedNotice("Saved stylists are not available in this environment.")
      return
    }

    if (!userProfile?.id) return

    try {
      setSavedLoading(true)
      setSavedError(null)
      setSavedNotice(null)

      const { data, error } = await supabase
        .from('saved_stylists')
        .select(`
          id,
          stylist_id,
          stylist:stylist_id (
            business_name,
            location,
            average_rating,
            review_count
          )
        `)
        .eq('client_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const transformedStylists: SavedStylist[] = (data || []).map((item: any) => {
        const stylistData = Array.isArray(item.stylist) ? item.stylist[0] : item.stylist

        return {
          id: item.id,
          stylist_id: item.stylist_id,
          business_name: stylistData?.business_name || 'Unknown stylist',
          location: stylistData?.location || 'Location not provided',
          average_rating: stylistData?.average_rating,
          review_count: stylistData?.review_count
        }
      })

      setSavedStylists(transformedStylists)
    } catch (err: any) {
      const message = (err?.message || 'Unable to load saved stylists').toLowerCase()
      if (message.includes("could not find the table") && message.includes("saved_stylists")) {
        setSavedStylists([])
        setSavedError(null)
        setSavedNotice("Saved stylists aren’t enabled yet. Add the saved_stylists table or hide this section.")
      } else {
        setSavedError(`Failed to load your saved stylists (${err?.message || 'Unknown error'})`)
      }
    } finally {
      setSavedLoading(false)
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

  const getNameParts = () => {
    const fullName = (userProfile?.full_name || '').trim()
    if (!fullName) {
      return { firstName: 'Not provided', lastName: 'Not provided' }
    }

    const [firstName, ...rest] = fullName.split(/\s+/)
    return {
      firstName: firstName || 'Not provided',
      lastName: rest.join(' ') || 'Not provided'
    }
  }

  useEffect(() => {
    if (userProfile?.id) {
      fetchClientReviews()
    }
  }, [userProfile?.id, refreshTrigger])

  useEffect(() => {
    if (userProfile?.id) {
      fetchSavedStylists()
    }
  }, [userProfile?.id])

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

  const nameParts = getNameParts()
  const accountEmail = userProfile?.email || 'Not provided'
  const accountRole = userProfile?.role || 'client'
  const renderSavedStylists = (showAll: boolean) => {
    const list = showAll ? savedStylists : savedStylists.slice(0, 5)

    return (
      <>
        {savedLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {savedError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {savedError}
            </AlertDescription>
          </Alert>
        )}

        {savedNotice && !savedError && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {savedNotice}
            </AlertDescription>
          </Alert>
        )}

        {!savedLoading && !savedError && savedStylists.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved stylists yet</h3>
            <p className="text-gray-500 mb-4">
              Tap the heart icon when browsing to save stylists you like.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/browse")}
            >
              Browse Stylists
            </Button>
          </div>
        )}

        {!savedLoading && !savedError && savedStylists.length > 0 && (
          <div className="mt-2 space-y-4">
            {list.map((stylist) => (
              <div
                key={stylist.id}
                className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold">
                      {stylist.business_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stylist.business_name}</p>
                      <div className="flex items-center text-sm text-gray-600 gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{stylist.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <StarDisplay
                      rating={stylist.average_rating || 0}
                      totalReviews={stylist.review_count || 0}
                      size="sm"
                      showReviewsLabel
                    />
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/stylist/${stylist.stylist_id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
            {!showAll && savedStylists.length > 5 && (
              <div className="text-sm text-gray-600 text-center">
                Showing 5 of {savedStylists.length} saved stylists.
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <DashboardHero
        eyebrow="Client Dashboard"
        eyebrowClassName="text-blue-600"
        title={<>Welcome back, {userProfile?.full_name || 'Client'}!</>}
        subtitle="Manage your saved stylists, reviews, and account details."
        subtitleClassName="text-base sm:text-lg text-blue-700/80 font-normal"
        gradientFrom="from-blue-50"
        gradientTo="to-indigo-50"
        borderClassName="border-blue-100"
      />

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
            value="saved"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Saved Stylists
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            My Reviews
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-xl">Saved Stylists</CardTitle>
                  <CardDescription>Quick access to the stylists you want to keep track of.</CardDescription>
                </div>
                <Badge variant="outline">
                  {savedStylists.length} saved
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {renderSavedStylists(false)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-xl">Saved Stylists</CardTitle>
                  <CardDescription>All the stylists you&apos;ve bookmarked.</CardDescription>
                </div>
                <Badge variant="outline">
                  {savedStylists.length} saved
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {renderSavedStylists(true)}
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

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-xl">Profile Information</CardTitle>
                  <CardDescription className="mt-1">
                    Update the details you shared when creating your client account.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 capitalize">
                  {accountRole} account
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-first-name" className="text-sm font-medium text-gray-700">First name</Label>
                    <Input
                      id="profile-first-name"
                      name="firstName"
                      defaultValue={nameParts.firstName}
                      placeholder="First name"
                      readOnly
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-last-name" className="text-sm font-medium text-gray-700">Last name</Label>
                    <Input
                      id="profile-last-name"
                      name="lastName"
                      defaultValue={nameParts.lastName}
                      placeholder="Last name"
                      readOnly
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="profile-email"
                      name="email"
                      type="email"
                      defaultValue={accountEmail}
                      className="pl-10 bg-white"
                      readOnly
                      placeholder="you@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Used for booking updates and notifications.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone" className="text-sm font-medium text-gray-700">Phone (optional)</Label>
                    <Input
                      id="profile-phone"
                      name="phone"
                      defaultValue={userProfile?.phone || ''}
                      placeholder="Add a phone number"
                      readOnly
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-member-since" className="text-sm font-medium text-gray-700">Member since</Label>
                    <Input
                      id="profile-member-since"
                      name="memberSince"
                      defaultValue={getMemberSince()}
                      readOnly
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900 capitalize">{accountRole}</span>
                    <span>account</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Editing coming soon. Contact support if you need to change these details.
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
