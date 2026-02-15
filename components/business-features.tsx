import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, Shield, Clock, Star } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Users,
    title: "Expand Your Client Base",
    description: "Connect with new customers actively searching for your services in your area.",
  },
  {
    icon: Calendar,
    title: "Easy Booking Management",
    description: "Streamline your appointments with our integrated booking system and calendar.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Revenue",
    description: "Increase your earnings with more bookings and premium service offerings.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid safely and on time with our secure payment processing system.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Set your own hours and availability to work when it suits you best.",
  },
  {
    icon: Star,
    title: "Build Your Reputation",
    description: "Showcase your work and collect reviews to build trust with potential clients.",
  },
]

export function BusinessFeatures() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Service4Me?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of beauty professionals who have transformed their business with our platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border shadow-sm hover:shadow-sm transition-shadow">
                <CardContent className="p-4 md:p-8 text-center">
                  <div className="mb-4">
                    <Icon className="h-8 w-8 md:h-12 md:w-12 text-red-600 mx-auto" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
