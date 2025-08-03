import { Navigation } from "@/components/navigation"
import { ClientDashboard } from "@/components/client-dashboard"
import { Footer } from "@/components/footer"

export default function ClientDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <ClientDashboard />
      <Footer />
    </div>
  )
}
