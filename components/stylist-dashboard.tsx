"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Star, Upload, ExternalLink, Settings, MessageSquare, Plus, Edit, Trash2, Scissors } from "lucide-react"
import Link from "next/link"

const stylistData = {
  name: "Maya Johnson",
  businessName: "RS Hair",
  image: "/placeholder.svg?height=100&width=100",
  rating: 4.9,
  reviewCount: 127,
  profileViews: 1250,
  location: "Barking, London",
  bio: "Passionate hairstylist specializing in natural hair care and protective styling. I believe every client deserves to feel beautiful and confident.",
  specialties: ["Braids", "Locs", "Natural Hair", "Protective Styles"],
  memberSince: "January 2023",
  services: [
    { id: 1, name: "Box Braids", price: 120, duration: "3-4 hours" },
    { id: 2, name: "Knotless Braids", price: 150, duration: "4-5 hours" },
    { id: 3, name: "Faux Locs", price: 180, duration: "5-6 hours" },
    { id: 4, name: "Twist Out", price: 85, duration: "2 hours" },
  ],
  gallery: [
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
  ],
}

const recentReviews = [
  {
    id: 1,
    client: "Sarah J.",
    rating: 5,
    comment:
      "Amazing work! Maya was so gentle and professional. My braids look perfect and she gave great hair care tips.",
    date: "2 days ago",
    service: "Knotless Braids",
  },
  {
    id: 2,
    client: "Jasmine K.",
    rating: 5,
    comment: "Best braider in London! Definitely booking again. The salon is clean and Maya is so talented.",
    date: "1 week ago",
    service: "Box Braids",
  },
  {
    id: 3,
    client: "Tiffany M.",
    rating: 4,
    comment: "Great service overall. Maya was professional and my hair looks amazing. Would recommend!",
    date: "2 weeks ago",
    service: "Twist Out",
  },
]

export function StylistDashboard() {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false)
  const [isAddingService, setIsAddingService] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [editingService, setEditingService] = useState<(typeof stylistData.services)[0] | null>(null)

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Welcome Header & Profile Stats - Side by Side */}
      <div className="grid grid-cols-1 gap-4 mb-5">
        {/* Welcome Header */}
        <div className="">
          <div className="bg-gray-100 rounded-xl p-6 h-full flex flex-col justify-center">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Hello {stylistData.businessName}</h1>
              <div className="flex flex-col space-y-2 mt-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{stylistData.rating}</span>
                  <span className="text-gray-600 ml-1">({stylistData.reviewCount} reviews)</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
                  Active Profile
                </Badge>
              </div>
              <div className="mt-4">
                <Link href="/stylist/1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings, Gallery & Services - Three Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Profile Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-red-600" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Logo</h4>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={stylistData.image || "/placeholder.svg"} />
                    <AvatarFallback>{stylistData.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Basic Information</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first-name" className="text-sm">
                      First Name
                    </Label>
                    <Input id="first-name" defaultValue="Maya" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="surname" className="text-sm">
                      Surname
                    </Label>
                    <Input id="surname" defaultValue="Johnson" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="business-name" className="text-sm">
                    Business Name
                  </Label>
                  <Input id="business-name" defaultValue={stylistData.businessName} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm">
                    Location
                  </Label>
                  <Input id="location" defaultValue={stylistData.location} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">
                    Phone Number
                  </Label>
                  <Input id="phone" placeholder="020 7946 0892" className="mt-1" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="text-sm">
                Bio
              </Label>
              <Textarea
                id="bio"
                defaultValue={stylistData.bio}
                rows={3}
                placeholder="Tell clients about yourself..."
                className="mt-1"
              />
            </div>

            {/* Specialties */}
            <div>
              <Label htmlFor="specialties" className="text-sm">
                Specialties
              </Label>
              <Input
                id="specialties"
                defaultValue={stylistData.specialties.join(", ")}
                placeholder="e.g., Braids, Locs, Natural Hair Care"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>

            {/* Booking Link */}
            <div>
              <Label htmlFor="booking-link" className="text-sm">
                Booking Link
              </Label>
              <Input id="booking-link" placeholder="https://your-booking-site.com" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">Link where clients can book appointments</p>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm">
                Address
              </Label>
              <Textarea id="address" placeholder="123 High Street, London, E1 1AA" rows={2} className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">Your business address</p>
            </div>

            {/* Social Media */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Social Media</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="instagram" className="text-sm">
                    Instagram
                  </Label>
                  <Input id="instagram" placeholder="@your_instagram" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="tiktok" className="text-sm">
                    TikTok
                  </Label>
                  <Input id="tiktok" placeholder="@your_tiktok" className="mt-1" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button className="w-full bg-red-600 hover:bg-red-700">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Gallery Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2 text-red-600" />
              Gallery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Gallery Images */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Current Gallery</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stylistData.gallery.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white p-1 h-auto"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload New Images */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Add New Images</h4>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-gray-50"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                  // Handle file drop logic here
                  console.log("Files dropped:", e.dataTransfer.files)
                }}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Gallery Images</h3>
                <p className="text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="gallery-upload"
                  onChange={(e) => {
                    // Handle file selection logic here
                    console.log("Files selected:", e.target.files)
                  }}
                />
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => document.getElementById("gallery-upload")?.click()}
                >
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-3">JPG, PNG or GIF. Max 5MB per image. Up to 20 images.</p>
              </div>
            </div>

            {/* Gallery Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Gallery Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload high-quality images of your best work</li>
                <li>• Show variety in your styles and techniques</li>
                <li>• Include before and after photos when possible</li>
                <li>• Keep images well-lit and professionally shot</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Card - Now Full Width */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Scissors className="w-5 h-5 mr-2 text-red-600" />
                My Services
              </CardTitle>
              <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="service-name">Service Name</Label>
                      <Input id="service-name" placeholder="e.g., Box Braids" />
                    </div>
                    <div>
                      <Label htmlFor="service-price">Price (£)</Label>
                      <Input id="service-price" type="number" placeholder="120" />
                    </div>
                    <div>
                      <Label htmlFor="service-duration">Duration</Label>
                      <Input id="service-duration" placeholder="e.g., 3-4 hours" />
                    </div>
                    <div>
                      <Label htmlFor="service-description">Description</Label>
                      <Textarea id="service-description" placeholder="Describe your service..." />
                    </div>
                    <div className="flex space-x-2">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700">Add Service</Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setIsAddingService(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Service</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-service-name">Service Name</Label>
                      <Input
                        id="edit-service-name"
                        defaultValue={editingService?.name}
                        placeholder="e.g., Box Braids"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-service-price">Price (£)</Label>
                      <Input
                        id="edit-service-price"
                        type="number"
                        defaultValue={editingService?.price}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-service-duration">Duration</Label>
                      <Input
                        id="edit-service-duration"
                        defaultValue={editingService?.duration}
                        placeholder="e.g., 3-4 hours"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-service-description">Description</Label>
                      <Textarea id="edit-service-description" placeholder="Describe your service..." />
                    </div>
                    <div className="flex space-x-2">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700">Save Changes</Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setEditingService(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stylistData.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-gray-600 text-sm">{service.duration}</p>
                    <p className="text-gray-700 text-sm font-medium">£{service.price}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" onClick={() => setEditingService(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Dialog */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Recent Reviews
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{review.client[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.client}</h4>
                      <p className="text-sm text-gray-600">{review.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
