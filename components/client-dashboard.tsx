"use client"

import { useState, useEffect, useRef } from "react"
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
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { DashboardHero } from "@/components/ui/dashboard-hero"
import { SectionHeader } from "@/components/ui/section-header"
import { SmallCtaButton } from "@/components/ui/small-cta-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/ui/empty-state"
import { SpecialistBadge } from "@/components/ui/specialist-badge"
import { postcodeToAreaName } from "@/lib/postcode-utils"

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
  specialties?: string[]
  portfolio_images?: string[]
}

interface SavedStylistsCarouselProps {
  stylists: SavedStylist[]
  totalCount: number
  showCounter?: boolean
  onViewProfile: (stylistId: string) => void
}

function getStylistImageUrl(stylist: SavedStylist) {
  if (stylist.portfolio_images && stylist.portfolio_images.length > 0) {
    return stylist.portfolio_images[0]
  }
  const encodedName = encodeURIComponent(stylist.business_name || "Hair Studio")
  return `/placeholder.svg?height=400&width=320&text=${encodedName}`
}

function getSpecialty(stylist: SavedStylist) {
  if (stylist.specialties && stylist.specialties.length > 0) {
    return stylist.specialties[0]
  }
  return "Hair Specialist"
}

function SavedStylistsCarousel({ stylists, totalCount, showCounter, onViewProfile }: SavedStylistsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollButtons = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return
    const scrollAmount = direction === "left" ? -300 : 300
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  useEffect(() => {
    checkScrollButtons()
  }, [stylists.length])

  return (
    <div className="relative">
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-sm rounded-full"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-sm rounded-full"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-4 pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={checkScrollButtons}
      >
        {stylists.map((stylist) => {
          const location = stylist.location ? postcodeToAreaName(stylist.location) : "London, UK"
          const specialty = getSpecialty(stylist)

          return (
            <Card
              key={stylist.id}
              className="flex-none w-[220px] sm:w-[240px] md:w-[250px] lg:w-[260px] cursor-pointer hover:shadow-sm transition"
              onClick={() => onViewProfile(stylist.stylist_id)}
            >
              <CardContent className="p-0">
                <div className="relative h-[180px] sm:h-[200px] w-full overflow-hidden rounded-t-lg">
                  <img
                    src={getStylistImageUrl(stylist)}
                    alt={stylist.business_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/80 rounded-md p-1.5 border border-white/60">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight truncate">
                      {stylist.business_name}
                    </h3>
                    {stylist.review_count && stylist.review_count > 0 ? (
                      <StarDisplay
                        rating={stylist.average_rating || 0}
                        totalReviews={stylist.review_count || 0}
                        size="sm"
                        showReviewsLabel={false}
                        className="[&_svg]:h-3 [&_svg]:w-3"
                      />
                    ) : (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
                        New
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs sm:text-sm truncate">{location}</span>
                  </div>

                  <SpecialistBadge specialty={specialty} className="text-[11px]" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showCounter && (
        <div className="text-sm text-gray-600 text-center mt-2">
          Showing {stylists.length} of {totalCount} saved stylists.
        </div>
      )}
    </div>
  )
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
            review_count,
            specialties,
            portfolio_images
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
          review_count: stylistData?.review_count,
          specialties: stylistData?.specialties || [],
          portfolio_images: stylistData?.portfolio_images || []
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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

        {!savedLoading && !savedError && !savedNotice && savedStylists.length === 0 && (
          <EmptyState
            icon={<Heart className="h-8 w-8 text-gray-400" />}
            title="No saved stylists yet"
            description="Tap the heart icon when browsing to save stylists you like."
            className="py-10 space-y-1"
            titleClassName="text-base font-medium text-gray-900"
            descriptionClassName="text-sm text-gray-500"
            action={
              <SmallCtaButton
                className="bg-red-600 text-white border-red-600 hover:bg-red-700"
                onClick={() => router.push("/browse")}
              >
                Browse Stylists
              </SmallCtaButton>
            }
          />
        )}

        {!savedLoading && !savedError && savedStylists.length > 0 && (
          <SavedStylistsCarousel
            stylists={list}
            totalCount={savedStylists.length}
            showCounter={!showAll && savedStylists.length > list.length}
            onViewProfile={(id) => router.push(`/stylist/${id}`)}
          />
        )}
      </>
    )
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <DashboardHero
        eyebrow="Client Dashboard"
        eyebrowClassName="text-green-600"
        title={<>Welcome, {userProfile?.full_name || 'Client'}!</>}
        subtitle="Manage your saved stylists, reviews, and account details."
        subtitleClassName="text-green-700/80"
        gradientFrom="from-emerald-50"
        gradientTo="to-teal-50"
        borderClassName="border-emerald-100"
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 p-0 h-auto gap-4 sm:gap-6 flex-nowrap overflow-x-auto whitespace-nowrap justify-start rounded-none w-full -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger
            value="dashboard"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-green-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-green-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            My Reviews
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="bg-transparent px-0 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:border-green-600 data-[state=active]:bg-transparent rounded-none transition-colors inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <SectionHeader
              title="Saved Stylists"
              description="Stylists you saved to revisit."
            />
            <CardContent>
              {renderSavedStylists(false)}
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
            <SectionHeader
              title="My Reviews"
              description="All your reviews and feedback"
            />
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
            <EmptyState
              icon={<MessageSquare className="h-8 w-8 text-gray-400" />}
              title="No reviews yet"
              description="Start by booking a service and leaving your first review."
              className="py-10 space-y-1"
              titleClassName="text-base font-medium text-gray-900"
              descriptionClassName="text-sm text-gray-500"
              action={
                <SmallCtaButton
                  className="bg-red-600 text-white border-red-600 hover:bg-red-700"
                  onClick={() => router.push("/browse")}
                >
                  Browse Stylists
                </SmallCtaButton>
              }
            />
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
            <SectionHeader
              title="Profile Information"
              description="Update the details you shared when creating your client account."
            />
            <CardContent className="pt-0">
              <div className="max-w-3xl">
                <Card>
                  <CardContent className="p-4 sm:p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-red-600" />
                      <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="profile-first-name" className="text-sm font-medium text-gray-700">First Name</Label>
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
                        <Label htmlFor="profile-last-name" className="text-sm font-medium text-gray-700">Last Name</Label>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="profile-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                        <Input
                          id="profile-email"
                          name="email"
                          type="email"
                          defaultValue={accountEmail}
                          className="bg-white"
                          readOnly
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <Input
                          id="profile-phone"
                          name="phone"
                          defaultValue={userProfile?.phone || ''}
                          placeholder="Add a phone number"
                          readOnly
                          className="bg-white"
                        />
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
