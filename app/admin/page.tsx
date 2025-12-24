import { AdminDashboard } from "@/components/admin-dashboard"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/lib/auth-v2"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <AdminDashboard />
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
