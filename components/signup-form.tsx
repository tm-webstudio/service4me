"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Scissors, CheckCircle } from "lucide-react"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userType, setUserType] = useState("stylist")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState("")
  
  const { signUp } = useAuth()
  const router = useRouter()

  const [clientData, setClientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [stylistData, setStylistData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  })

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (clientData.password !== clientData.confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    setLoading(true)
    
    try {
      const result = await signUp(
        clientData.email, 
        clientData.password, 
        "client",
        {
          full_name: `${clientData.firstName} ${clientData.lastName}`.trim()
        }
      )
      
      console.log("Client signup result:", result)
      
      if (result.user && !result.user.email_confirmed_at) {
        setSuccessEmail(clientData.email)
        setSignupSuccess(true)
        return
      }
      
      router.push("/dashboard/client")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleStylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (stylistData.password !== stylistData.confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    setLoading(true)
    
    try {
      const result = await signUp(
        stylistData.email, 
        stylistData.password, 
        "stylist",
        {
          full_name: `${stylistData.firstName} ${stylistData.lastName}`.trim(),
          phone: stylistData.phone,
          businessName: stylistData.businessName,
          location: stylistData.location
        }
      )
      
      console.log("Stylist signup result:", result)
      
      if (result.user && !result.user.email_confirmed_at) {
        setSuccessEmail(stylistData.email)
        setSignupSuccess(true)
        return
      }
      
      router.push("/dashboard/stylist")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Join the Service4Me community</p>
        </div>

        <Card className="border shadow-sm">
          {!signupSuccess && (
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-center text-xl">Sign up</CardTitle>
            </CardHeader>
          )}
          <CardContent>
            {signupSuccess ? (
              <div className="text-center pt-6">
                <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Thanks for signing up!
                </h3>
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation email to <strong>{successEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Please check your inbox and click the confirmation link to complete your registration.
                </p>
                <div>
                  <Link href="/login">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Go to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <Tabs value={userType} onValueChange={setUserType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stylist" className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Stylist
                </TabsTrigger>
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="mt-6">
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-firstName" className="text-sm font-medium">
                        First name
                      </Label>
                      <Input
                        id="client-firstName"
                        type="text"
                        value={clientData.firstName}
                        onChange={(e) => setClientData({ ...clientData, firstName: e.target.value })}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-lastName" className="text-sm font-medium">
                        Last name
                      </Label>
                      <Input
                        id="client-lastName"
                        type="text"
                        value={clientData.lastName}
                        onChange={(e) => setClientData({ ...clientData, lastName: e.target.value })}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="client-email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="client-email"
                        type="email"
                        value={clientData.email}
                        onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                        className="pl-10"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="client-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="client-password"
                        type={showPassword ? "text" : "password"}
                        value={clientData.password}
                        onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                        className="pl-10 pr-10"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="client-confirmPassword" className="text-sm font-medium">
                      Confirm password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="client-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={clientData.confirmPassword}
                        onChange={(e) => setClientData({ ...clientData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="client-terms"
                      name="client-terms"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="client-terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the{" "}
                      <Link href="/terms" className="text-red-600 hover:text-red-500">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-red-600 hover:text-red-500">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Client Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="stylist" className="mt-6">
                <form onSubmit={handleStylistSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stylist-firstName" className="text-sm font-medium">
                        First name
                      </Label>
                      <Input
                        id="stylist-firstName"
                        type="text"
                        value={stylistData.firstName}
                        onChange={(e) => setStylistData({ ...stylistData, firstName: e.target.value })}
                        placeholder="Maya"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stylist-lastName" className="text-sm font-medium">
                        Last name
                      </Label>
                      <Input
                        id="stylist-lastName"
                        type="text"
                        value={stylistData.lastName}
                        onChange={(e) => setStylistData({ ...stylistData, lastName: e.target.value })}
                        placeholder="Johnson"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stylist-businessName" className="text-sm font-medium">
                      Business name
                    </Label>
                    <Input
                      id="stylist-businessName"
                      type="text"
                      value={stylistData.businessName}
                      onChange={(e) => setStylistData({ ...stylistData, businessName: e.target.value })}
                      placeholder="Maya's Hair Studio"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stylist-email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="stylist-email"
                        type="email"
                        value={stylistData.email}
                        onChange={(e) => setStylistData({ ...stylistData, email: e.target.value })}
                        className="pl-10"
                        placeholder="maya@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stylist-phone" className="text-sm font-medium">
                      Phone number
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="stylist-phone"
                        type="tel"
                        value={stylistData.phone}
                        onChange={(e) => setStylistData({ ...stylistData, phone: e.target.value })}
                        className="pl-10"
                        placeholder="020 7946 0892"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stylist-location" className="text-sm font-medium">
                      Postcode
                    </Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="stylist-location"
                        type="text"
                        value={stylistData.location}
                        onChange={(e) => setStylistData({ ...stylistData, location: e.target.value.toUpperCase() })}
                        className="pl-10"
                        placeholder="SW1A 1AA"
                        maxLength={8}
                        pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
                        title="Please enter a valid UK postcode (e.g., SW1A 1AA)"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stylist-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="stylist-password"
                        type={showPassword ? "text" : "password"}
                        value={stylistData.password}
                        onChange={(e) => setStylistData({ ...stylistData, password: e.target.value })}
                        className="pl-10 pr-10"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stylist-confirmPassword" className="text-sm font-medium">
                      Confirm password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="stylist-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={stylistData.confirmPassword}
                        onChange={(e) => setStylistData({ ...stylistData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="stylist-terms"
                      name="stylist-terms"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="stylist-terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the{" "}
                      <Link href="/terms" className="text-red-600 hover:text-red-500">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-red-600 hover:text-red-500">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Stylist Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

                <div className="mt-6">
                  <Separator className="my-4" />
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <Link href="/login" className="text-sm text-red-600 hover:text-red-500 font-medium">
                      Sign in
                    </Link>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
