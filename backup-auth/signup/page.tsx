import { Navigation } from "@/components/navigation"
import { SignupForm } from "@/components/signup-form"
import { Footer } from "@/components/footer"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <SignupForm />
      <Footer />
    </div>
  )
}
