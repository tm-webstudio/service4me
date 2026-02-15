import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const categories = [
  {
    name: "Wigs",
    image: "/images/wigs-weave-2.jpg",
    slug: "wigs-weaves",
    description: "Professional wig installations, weave applications, and hair extensions",
    stylistCount: 38,
  },
  {
    name: "Braids",
    image: "/images/braids.jpg",
    slug: "braids",
    description: "Protective braiding styles, box braids, knotless braids, and creative patterns",
    stylistCount: 45,
  },
  {
    name: "Locs",
    image: "/images/locs.jpg",
    slug: "locs",
    description: "Loc maintenance, styling, and professional loc installation services",
    stylistCount: 28,
  },
  {
    name: "Natural Hair",
    image: "/images/natural.jpg",
    slug: "natural-hair",
    description: "Natural hair health, styling, maintenance, and curl enhancement",
    stylistCount: 41,
  },
  {
    name: "Bridal Hair",
    image: "/images/bridal.jpg",
    slug: "bridal-hair",
    description: "Wedding hair styling, updos, and special occasion hair services",
    stylistCount: 22,
  },
  {
    name: "Silk Press",
    image: "/images/silk-press.jpg",
    slug: "silk-press",
    description: "Smooth, sleek silk press techniques for healthy hair transformations",
    stylistCount: 32,
  },
]

export function CollectionGrid() {
  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {categories.map((category, index) => (
          <Link key={index} href={`/browse?category=${encodeURIComponent(category.name)}`}>
            <Card className="group cursor-pointer hover:shadow-sm transition-shadow h-full">
              <CardContent className="p-0 h-full">
                <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "4/5" }}>
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="font-bold text-lg text-white text-center">{category.name}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Popular Searches */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Searches</h2>
        <div className="flex flex-wrap gap-3">
          {[
            "Box Braids",
            "Knotless Braids",
            "Silk Press",
            "Wig Installation",
            "Natural Hair",
            "Hair Color",
            "Protective Styles",
            "Locs",
            "Twist Out",
            "Deep Conditioning",
          ].map((search, index) => (
            <Link
              key={index}
              href={`/browse?search=${encodeURIComponent(search)}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition-colors"
            >
              {search}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
