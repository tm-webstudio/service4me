import { AdminDashboard } from "@/components/admin-dashboard"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-8">
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  )
}
