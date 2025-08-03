import { Navigation } from "@/components/navigation"
import { StylistDashboard } from "@/components/stylist-dashboard"
import { Footer } from "@/components/footer"

export default function StylistDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <StylistDashboard />
      <Footer />
    </div>
  )
}
