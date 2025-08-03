"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Plus, User, MapPin, Upload, Scissors, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock data for pending stylists
const pendingStylists = [
  {
    id: 1,
    name: "Zara Mitchell",
    businessName: "Natural Beauty Studio",
    email: "zara.mitchell@email.com",
    phone: "+44 7123 456789",
    location: "North London",
    specialties: ["Natural Hair", "Protective Styles"],
    experience: "8 years",
    bio: "Specializing in natural hair care and protective styling. I believe in enhancing your natural beauty while maintaining hair health.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
  {
    id: 2,
    name: "Amara Okafor",
    businessName: "Braids & Beyond",
    email: "amara.okafor@email.com",
    phone: "+44 7987 654321",
    location: "South London",
    specialties: ["Braids", "Twists"],
    experience: "6 years",
    bio: "Expert in intricate braiding techniques and twist styles. Creating beautiful, long-lasting protective styles for all hair types.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
  {
    id: 3,
    name: "Keisha Williams",
    businessName: "Loc Love Salon",
    email: "keisha.williams@email.com",
    phone: "+44 7456 123789",
    location: "East London",
    specialties: ["Locs", "Maintenance"],
    experience: "10 years",
    bio: "Loc specialist with over a decade of experience. From starter locs to maintenance and styling, I've got you covered.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
  {
    id: 4,
    name: "Nia Thompson",
    businessName: "Silk & Shine",
    email: "nia.thompson@email.com",
    phone: "+44 7789 456123",
    location: "West London",
    specialties: ["Silk Press", "Blowouts"],
    experience: "7 years",
    bio: "Master of the silk press technique. Achieving smooth, sleek styles while maintaining hair health and integrity.",
    image: "/placeholder-user.jpg",
    status: "pending",
  },
]

export function AdminDashboard() {
  const [stylists, setStylists] = useState(pendingStylists)
  const [isAddingService, setIsAddingService] = useState(false)
  const [newStylist, setNewStylist] = useState({
    name: "",
    businessName: "",
    location: "",
    phone: "",
    bio: "",
    specialties: "",
    instagram: "",
    tiktok: "",
    services: [
      { id: 1, name: "Box Braids", price: 120, duration: "3-4 hours" },
      { id: 2, name: "Knotless Braids", price: 150, duration: "4-5 hours" },
    ],
  })

  const handleApprove = (id: number) => {
    setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
    // In a real app, this would make an API call to approve the stylist
    console.log("Approving stylist:", id)
  }

  const handleReject = (id: number) => {
    setStylists((prev) => prev.filter((stylist) => stylist.id !== id))
    // In a real app, this would make an API call to reject the stylist
    console.log("Rejecting stylist:", id)
  }

  const handleCreateStylist = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would make an API call to create the stylist
    console.log("Creating new stylist:", newStylist)
    // Reset form
    setNewStylist({
      name: "",
      businessName: "",
      location: "",
      phone: "",
      bio: "",
      specialties: "",
      instagram: "",
      tiktok: "",
      services: [
        { id: 1, name: "Box Braids", price: 120, duration: "3-4 hours" },
        { id: 2, name: "Knotless Braids", price: 150, duration: "4-5 hours" },
      ],
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage stylist profiles and verifications</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="create">Create Stylist</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stylists Awaiting Verification</CardTitle>
              <CardDescription>Review and approve or reject stylist applications</CardDescription>
            </CardHeader>
            <CardContent>
              {stylists.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
                  <p className="mt-1 text-sm text-gray-500">All stylist applications have been processed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {stylists.map((stylist) => (
                    <Card key={stylist.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-4 w-full lg:w-auto space-y-4 lg:space-y-0">
                            {/* Large gallery image - full width on mobile, fixed width on desktop */}
                            <div className="w-full lg:w-64 h-48 lg:h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src="/placeholder.svg"
                                alt={`${stylist.name}'s work`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Stylist information */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src="/placeholder.svg"
                                    alt={`${stylist.businessName}'s profile`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{stylist.businessName}</h3>
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {stylist.location}
                                </div>
                                <div className="mt-2">
                                  <span className="text-sm text-gray-600">Experience: {stylist.experience}</span>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {stylist.specialties.map((specialty) => (
                                  <Badge key={specialty} variant="secondary">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                              <div className="mt-3">
                                <p className="text-sm text-gray-700">{stylist.bio}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex space-x-2 w-full lg:w-auto lg:justify-end">
                            <Button
                              onClick={() => handleApprove(stylist.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(stylist.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Profile Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-red-600" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>N</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" type="button">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-sm">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={newStylist.name}
                        onChange={(e) => setNewStylist((prev) => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-name" className="text-sm">
                        Business Name
                      </Label>
                      <Input
                        id="business-name"
                        value={newStylist.businessName}
                        onChange={(e) => setNewStylist((prev) => ({ ...prev, businessName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={newStylist.location}
                        onChange={(e) => setNewStylist((prev) => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        placeholder="020 7946 0892"
                        value={newStylist.phone}
                        onChange={(e) => setNewStylist((prev) => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
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
                    value={newStylist.bio}
                    onChange={(e) => setNewStylist((prev) => ({ ...prev, bio: e.target.value }))}
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
                    value={newStylist.specialties}
                    onChange={(e) => setNewStylist((prev) => ({ ...prev, specialties: e.target.value }))}
                    placeholder="e.g., Braids, Locs, Natural Hair Care"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                </div>

                {/* Social Media */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Social Media</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="instagram" className="text-sm">
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        placeholder="@your_instagram"
                        value={newStylist.instagram}
                        onChange={(e) => setNewStylist((prev) => ({ ...prev, instagram: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok" className="text-sm">
                        TikTok
                      </Label>
                      <Input
                        id="tiktok"
                        placeholder="@your_tiktok"
                        value={newStylist.tiktok}
                        onChange={(e) => setNewStylist((prev) => ({ ...prev, tiktok: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
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
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="relative group">
                        <img
                          src="/placeholder.svg"
                          alt={`Gallery ${index}`}
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
                  <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-gray-300 hover:border-red-400 hover:bg-gray-50">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Gallery Images</h3>
                    <p className="text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
                    <input type="file" multiple accept="image/*" className="hidden" id="gallery-upload" />
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

          {/* Services Card - Full Width */}
          <div className="mb-8">
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newStylist.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-gray-600 text-sm">{service.duration}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold">£{service.price}</span>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleCreateStylist} className="bg-red-600 hover:bg-red-700">
              Create Stylist Profile
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
