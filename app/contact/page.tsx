import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContactSection } from "@/components/contact-section"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <ContactSection />
      <Footer />
    </div>
  )
}
