import { Navigation } from "@/components/navigation"
import { StylistDashboard } from "@/components/stylist-dashboard"
import { Footer } from "@/components/footer"
import { ProtectedStylistRoute } from "@/components/protected-stylist-route"

export default function StylistDashboardPage() {
  return (
    <ProtectedStylistRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <StylistDashboard />
        <Footer />
      </div>
    </ProtectedStylistRoute>
  )
}
