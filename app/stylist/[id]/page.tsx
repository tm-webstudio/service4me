import { Navigation } from "@/components/navigation"
import { StylistProfile } from "@/components/stylist-profile"
import { Footer } from "@/components/footer"

export default function StylistProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <StylistProfile />
      <Footer />
    </div>
  )
}
