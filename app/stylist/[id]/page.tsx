import { Navigation } from "@/components/navigation"
import { StylistProfile } from "@/components/stylist-profile"
import { Footer } from "@/components/footer"

export default async function StylistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <StylistProfile stylistId={id} />
      <Footer />
    </div>
  )
}
