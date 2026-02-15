import { Navigation } from "@/components/navigation"
import { StylistDashboard } from "@/components/stylist-dashboard"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/lib/auth"

export default function StylistDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['stylist']}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <StylistDashboard />
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
