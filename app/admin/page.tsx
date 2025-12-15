import { AdminDashboard } from "@/components/admin-dashboard"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProtectedAdminRoute } from "@/components/protected-admin-route"

export default function AdminPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <AdminDashboard />
        <Footer />
      </div>
    </ProtectedAdminRoute>
  )
}
