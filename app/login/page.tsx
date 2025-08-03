import { Navigation } from "@/components/navigation"
import { LoginForm } from "@/components/login-form"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <LoginForm />
      <Footer />
    </div>
  )
}
