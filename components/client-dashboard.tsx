"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

const clientData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  memberSince: "January 2024",
}

const reviewHistory = [
  {
    id: 1,
    stylist: "Maya Johnson",
    service: "Knotless Braids",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Amazing work! Maya was so gentle and professional. My braids look perfect and she gave great hair care tips.",
  },
  {
    id: 2,
    stylist: "Zara Williams",
    service: "Silk Press",
    rating: 5,
    date: "1 month ago",
    comment: "Best silk press I've ever had! My hair was so smooth and bouncy. Zara really knows what she's doing.",
  },
  {
    id: 3,
    stylist: "Keisha Davis",
    service: "Wig Installation",
    rating: 4,
    date: "2 months ago",
    comment: "Great service overall. The wig looks natural and Keisha was very professional. Would book again!",
  },
]

export function ClientDashboard() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {clientData.name}!</h1>
            <p className="text-gray-600 mt-1">Member since {clientData.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Reviews Only */}
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {reviewHistory.map((review) => (
              <Card key={review.id} className="mb-4 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{review.service}</h3>
                      <p className="text-gray-600">with {review.stylist}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
