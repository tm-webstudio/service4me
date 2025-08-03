import { Navigation } from "@/components/navigation"
import { BusinessHero } from "@/components/business-hero"
import { BusinessFeatures } from "@/components/business-features"
import { BusinessBenefits } from "@/components/business-benefits"
import { BusinessTestimonials } from "@/components/business-testimonials"
import { BusinessPricing } from "@/components/business-pricing"
import { BusinessCTA } from "@/components/business-cta"
import { Footer } from "@/components/footer"

export default function ForBusinessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <BusinessHero />
      <BusinessFeatures />
      <BusinessBenefits />
      <BusinessTestimonials />
      <BusinessPricing />
      <BusinessCTA />
      <Footer />
    </div>
  )
}
