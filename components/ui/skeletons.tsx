import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton for stylist cards in grid and carousel
export function StylistCardSkeleton() {
  return (
    <Card className="group cursor-pointer hover:shadow-sm transition-all duration-300 border h-full">
      <CardContent className="p-0 h-full">
        <div className="relative aspect-[4/3]">
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
    <div className="space-y-2 md:space-y-3">
      {/* Gallery skeleton */}
      <div className="relative">
        {/* Verified badge */}
        <div className="absolute top-4 left-4 z-10">
          <Skeleton className="h-6 w-28 rounded-full" />
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
              {/* Show all photos button */}
              <Skeleton className="absolute bottom-4 right-4 h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Mobile Slideshow */}
        <div className="md:hidden relative">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
            {/* Mobile save/share buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Skeleton className="w-9 h-9 rounded-md" />
              <Skeleton className="w-9 h-9 rounded-md" />
            </div>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-2 h-2 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Business Info skeleton */}
      <div>
        {/* Name + rating row */}
        <div className="relative mb-1">
          <div className="flex items-start justify-between md:block">
            <Skeleton className="h-7 md:h-8 w-3/5 md:w-2/3" />
            {/* Mobile rating */}
            <div className="flex items-center md:hidden ml-3 mt-1 flex-shrink-0">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-8 ml-1" />
              <Skeleton className="h-4 w-6 ml-1" />
            </div>
          </div>
          {/* Desktop save/share buttons */}
          <div className="hidden md:flex absolute top-0 right-0 gap-2">
            <Skeleton className="w-10 h-10 rounded-md" />
            <Skeleton className="w-10 h-10 rounded-md" />
          </div>
        </div>

        {/* Specialist badge + experience */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="w-1 h-1 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Mobile: Location + type */}
        <div className="flex items-center sm:hidden mb-4">
          <Skeleton className="w-4 h-4 mr-1.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="w-1 h-1 mx-2 rounded-full" />
          <Skeleton className="w-4 h-4 mr-1.5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Desktop: Location + type */}
        <div className="hidden sm:flex items-center mb-4">
          <Skeleton className="w-4 h-4 mr-1.5 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="w-1 h-1 mx-2 rounded-full" />
          <Skeleton className="w-4 h-4 mr-1.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Bio skeleton */}
      <div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-11/12 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />

        {/* Mobile & Same Day tags */}
        <div className="flex gap-3 mb-2.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Book Now Button + Instagram */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-11 w-full sm:w-2/5 rounded-md" />
          <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
        </div>
      </div>

      {/* Services skeleton */}
      <div className="space-y-4 pt-6 w-full sm:w-1/2">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-stretch space-x-3">
                  <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-between min-h-[64px]">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  <div className="self-stretch flex items-end">
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional services tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-3.5 w-28" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-sm" />
          ))}
        </div>
      </div>

      {/* Reviews skeleton */}
      <div className="pt-6 space-y-4 w-full">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Skeleton key={star} className="w-3.5 h-3.5 mr-0.5 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3.5 w-full mb-1.5" />
                  <Skeleton className="h-3.5 w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for sidebar cards
function SidebarCardSkeleton({ title, children }: { title: string; children: React.ReactNode }) {
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

