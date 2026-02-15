import { Navigation } from '@/components/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { Footer } from '@/components/footer'
import { PublicRoute } from '@/lib/auth'

export default function LoginPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoginForm />
        <Footer />
      </div>
    </PublicRoute>
  )
}
