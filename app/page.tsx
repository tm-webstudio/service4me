import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturedStylists } from "@/components/featured-stylists"
import { CategoryCarousel } from "@/components/category-carousel"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <CategoryCarousel />
      <FeaturedStylists />
      <Footer />
    </div>
  )
}
