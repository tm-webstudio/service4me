import { Navigation } from "@/components/navigation"
import { ClientDashboard } from "@/components/client-dashboard"
import { Footer } from "@/components/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Dashboard - Service4Me",
  description: "Manage your reviews and bookings on Service4Me"
}

export default function ClientDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <ClientDashboard />
      <Footer />
    </div>
  )
}
