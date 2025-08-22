import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton for stylist cards in grid and carousel
export function StylistCardSkeleton() {
  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md h-full">
      <CardContent className="p-0 h-full">
        <div className="relative aspect-square md:aspect-[4/3]">
          <Skeleton className="w-full h-full rounded-t-lg" />
          {/* Heart icon skeleton */}
          <div className="absolute top-3 right-3">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          {/* Verified badge skeleton */}
          <div className="absolute top-3 left-3">
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
        </div>

        <div className="p-2 md:p-4">
          {/* Mobile Layout - Title first, then stars below */}
          <div className="md:hidden">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex items-center space-x-1 mb-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>

          {/* Desktop Layout - Title and stars side by side */}
          <div className="hidden md:flex items-center justify-between mb-2">
            <Skeleton className="h-6 w-2/3" />
            <div className="flex items-center space-x-1">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>

          <div className="flex items-center mb-3">
            <Skeleton className="w-4 h-4 mr-1 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="mb-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton for stylist profile header
export function StylistProfileSkeleton() {
  return (
    <div className="space-y-5">
      {/* Gallery skeleton */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Desktop Gallery Grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-2 row-span-2 aspect-square">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="col-span-1 aspect-square">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="col-span-1 aspect-square">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="col-span-1 aspect-square">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="col-span-1 aspect-square relative">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Mobile Slideshow */}
        <div className="md:hidden relative">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Business Info skeleton */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2">
              <div className="flex items-center mb-2 sm:mb-0">
                <Skeleton className="w-5 h-5 mr-1 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8 ml-1" />
              </div>
              <div className="flex items-center">
                <Skeleton className="w-4 h-4 mr-1 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex items-center mb-2">
              <Skeleton className="w-4 h-4 mr-1 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>

          <div className="flex space-x-2">
            <Skeleton className="w-10 h-10 rounded-md" />
            <Skeleton className="w-10 h-10 rounded-md" />
          </div>
        </div>
      </div>

      {/* Bio skeleton */}
      <div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-6" />

        {/* Book Now Button skeleton */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-full sm:w-2/5 rounded-md" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for services section
export function ServicesSkeleton() {
  return (
    <div className="space-y-6 max-w-lg">
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <div className="flex items-center mb-2">
                    <Skeleton className="w-4 h-4 mr-1 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Skeleton for sidebar cards
export function SidebarCardSkeleton({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="p-4">
        {children}
      </div>
    </Card>
  )
}

// Skeleton for location card
export function LocationCardSkeleton() {
  return (
    <SidebarCardSkeleton title="Location">
      <div className="flex items-center mb-3">
        <Skeleton className="w-4 h-4 mr-2 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="w-full h-48 rounded-lg" />
    </SidebarCardSkeleton>
  )
}

// Skeleton for contact card
export function ContactCardSkeleton() {
  return (
    <SidebarCardSkeleton title="Contact">
      <div className="space-y-4">
        <div className="flex items-center">
          <Skeleton className="w-4 h-4 mr-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center">
          <Skeleton className="w-4 h-4 mr-3 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        </div>
      </div>
    </SidebarCardSkeleton>
  )
}

// Skeleton for reviews section
export function ReviewsSkeleton() {
  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Skeleton key={star} className="w-4 h-4 mr-1 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-1" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Skeleton for dashboard gallery
export function DashboardGallerySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  )
}