import { Navigation } from "@/components/navigation"
import { CollectionHeader } from "@/components/collection-header"
import { CollectionGrid } from "@/components/collection-grid"
import { Footer } from "@/components/footer"

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <CollectionHeader />
      <CollectionGrid />
      <Footer />
    </div>
  )
}
