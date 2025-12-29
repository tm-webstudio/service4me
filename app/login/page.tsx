import { Navigation } from '@/components/navigation'
import { LoginFormV2 } from '@/components/auth-v2/login-form'
import { Footer } from '@/components/footer'
import { PublicRoute } from '@/lib/auth-v2'

export default function LoginPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoginFormV2 />
        <Footer />
      </div>
    </PublicRoute>
  )
}
