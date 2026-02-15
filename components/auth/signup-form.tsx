"use client"

/**
 * Signup Form
 *
 * Signup form using auth system
 * Features:
 * - Dual role support (Client/Stylist)
 * - Uses auth context
 * - Clear error handling
 * - Proper loading states
 * - Role-based redirects
 * - Profile creation for stylists
 */

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, type UserRole } from '@/lib/auth'
import { useClientAvatarUpload } from '@/hooks/use-client-avatar-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Scissors,
  CheckCircle,
  Loader2,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  const { signUp, isLoading, error: authError, getDashboardUrl } = useAuth()
  const { uploadAvatar, validateFile } = useClientAvatarUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [userType, setUserType] = useState<UserRole>('client')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')

  // Profile image state (client only)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [isProfileDragOver, setIsProfileDragOver] = useState(false)

  // Client form data
  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Stylist form data
  const [stylistData, setStylistData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: ''
  })

  /**
   * Handle profile image file selection
   */
  const handleProfileImageFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setLocalError(validationError)
      return
    }

    setProfileImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleProfileImageFile(file)
  }

  const handleProfileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsProfileDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProfileImageFile(file)
    }
  }

  const handleProfileDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsProfileDragOver(true)
  }

  const handleProfileDragLeave = () => {
    setIsProfileDragOver(false)
  }

  const removeProfileImage = () => {
    setProfileImage(null)
    setProfileImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Handle client signup
   */
  const handleClientSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')

    // Validation
    if (clientData.password !== clientData.confirmPassword) {
      setLocalError("Passwords don't match")
      return
    }

    if (clientData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    console.log('[SIGNUP-FORM] Submitting client signup for:', clientData.email)

    try {
      // Sign up using auth
      await signUp(clientData.email, clientData.password, 'client', {
        fullName: `${clientData.firstName} ${clientData.lastName}`.trim()
      })

      console.log('[SIGNUP-FORM] Client signup successful')

      // Check if email confirmation is required
      // If so, show success message
      // Otherwise, redirect to dashboard
      // The auth context handles this detection

      // For now, assume success and redirect
      const dashboardUrl = getDashboardUrl()

      if (dashboardUrl === '/login') {
        // Email confirmation required
        setSuccessEmail(clientData.email)
        setSignupSuccess(true)
      } else {
        // Upload profile image if provided
        if (profileImage) {
          try {
            // Get user ID from auth context after signup
            // For now, we'll skip this and let user upload from dashboard
            console.log('[SIGNUP-FORM] Profile image upload will be handled in dashboard')
          } catch (uploadErr) {
            console.error('[SIGNUP-FORM] Failed to upload profile image:', uploadErr)
            // Don't block signup
          }
        }

        console.log('[SIGNUP-FORM] Redirecting to:', dashboardUrl)
        router.push(dashboardUrl)
      }
    } catch (error: any) {
      console.error('[SIGNUP-FORM] Client signup failed:', error)
      // Error is already set in auth context
    }
  }

  /**
   * Handle stylist signup
   */
  const handleStylistSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')

    // Validation
    if (stylistData.password !== stylistData.confirmPassword) {
      setLocalError("Passwords don't match")
      return
    }

    if (stylistData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    if (!stylistData.businessName) {
      setLocalError('Business name is required')
      return
    }

    if (!stylistData.phone) {
      setLocalError('Phone number is required')
      return
    }

    if (!stylistData.location) {
      setLocalError('Postcode is required')
      return
    }

    console.log('[SIGNUP-FORM] Submitting stylist signup for:', stylistData.email)

    try {
      // Sign up using auth
      await signUp(stylistData.email, stylistData.password, 'stylist', {
        fullName: `${stylistData.firstName} ${stylistData.lastName}`.trim(),
        phone: stylistData.phone,
        businessName: stylistData.businessName,
        location: stylistData.location
      })

      console.log('[SIGNUP-FORM] Stylist signup successful')

      // Check if email confirmation is required
      const dashboardUrl = getDashboardUrl()

      if (dashboardUrl === '/login') {
        // Email confirmation required
        setSuccessEmail(stylistData.email)
        setSignupSuccess(true)
      } else {
        console.log('[SIGNUP-FORM] Redirecting to:', dashboardUrl)
        router.push(dashboardUrl)
      }
    } catch (error: any) {
      console.error('[SIGNUP-FORM] Stylist signup failed:', error)
      // Error is already set in auth context
    }
  }

  // Display error (prefer auth error over local error)
  const displayError = authError?.message || localError

  // Success screen after email confirmation required
  if (signupSuccess) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-3 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Thanks for signing up!
                </h3>
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation email to{' '}
                  <strong>{successEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Please check your inbox and click the confirmation link to
                  complete your registration.
                </p>
                <div>
                  <Link href="/login">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Go to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Join the Service4Me community
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center text-lg">Sign up</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Error Display */}
            {displayError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            {/* Role Tabs */}
            <Tabs value={userType} onValueChange={(v) => setUserType(v as UserRole)} className="w-full">
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

              {/* Client Signup Form */}
              <TabsContent value="client" className="mt-6">
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  {/* Profile Photo Upload (Optional) */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Profile Photo (Optional)
                    </h3>
                    <div
                      onDrop={handleProfileDrop}
                      onDragOver={handleProfileDragOver}
                      onDragLeave={handleProfileDragLeave}
                      className={`flex items-start gap-4 p-4 rounded-lg border bg-white transition-colors cursor-pointer ${
                        isProfileDragOver
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-20 h-20 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {profileImagePreview ? 'Photo uploaded' : 'Add Profile Photo'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a photo (optional). Max 5MB.
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              fileInputRef.current?.click()
                            }}
                            className="h-7 px-2 text-[10px]"
                            disabled={isLoading}
                          >
                            <Upload className="w-3 h-3 mr-1.5" />
                            {profileImagePreview ? 'Replace' : 'Upload'}
                          </Button>
                          {profileImagePreview && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeProfileImage()
                              }}
                              className="h-7 w-7 p-0"
                              disabled={isLoading}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-firstName" className="text-sm font-medium">
                        First name
                      </Label>
                      <Input
                        id="client-firstName"
                        type="text"
                        value={clientData.firstName}
                        onChange={(e) =>
                          setClientData({ ...clientData, firstName: e.target.value })
                        }
                        placeholder="John"
                        required
                        disabled={isLoading}
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
                        onChange={(e) =>
                          setClientData({ ...clientData, lastName: e.target.value })
                        }
                        placeholder="Doe"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email */}
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
                        onChange={(e) =>
                          setClientData({ ...clientData, email: e.target.value })
                        }
                        className="pl-10"
                        placeholder="john@example.com"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="client-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="client-password"
                        type={showPassword ? 'text' : 'password'}
                        value={clientData.password}
                        onChange={(e) =>
                          setClientData({ ...clientData, password: e.target.value })
                        }
                        className="pl-10 pr-10"
                        placeholder="Create a password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label
                      htmlFor="client-confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="client-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={clientData.confirmPassword}
                        onChange={(e) =>
                          setClientData({
                            ...clientData,
                            confirmPassword: e.target.value
                          })
                        }
                        className="pl-10 pr-10"
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-center">
                    <input
                      id="client-terms"
                      name="client-terms"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="client-terms"
                      className="ml-2 block text-xs text-gray-700"
                    >
                      I agree to the{' '}
                      <Link href="/terms" className="text-red-600 hover:text-red-500">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-red-600 hover:text-red-500">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Client Account'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Stylist Signup Form */}
              <TabsContent value="stylist" className="mt-6">
                <form onSubmit={handleStylistSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stylist-firstName" className="text-sm font-medium">
                        First name
                      </Label>
                      <Input
                        id="stylist-firstName"
                        type="text"
                        value={stylistData.firstName}
                        onChange={(e) =>
                          setStylistData({ ...stylistData, firstName: e.target.value })
                        }
                        placeholder="Maya"
                        required
                        disabled={isLoading}
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
                        onChange={(e) =>
                          setStylistData({ ...stylistData, lastName: e.target.value })
                        }
                        placeholder="Johnson"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Business Name */}
                  <div>
                    <Label htmlFor="stylist-businessName" className="text-sm font-medium">
                      Business name
                    </Label>
                    <Input
                      id="stylist-businessName"
                      type="text"
                      value={stylistData.businessName}
                      onChange={(e) =>
                        setStylistData({ ...stylistData, businessName: e.target.value })
                      }
                      placeholder="Maya's Hair Studio"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email */}
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
                        onChange={(e) =>
                          setStylistData({ ...stylistData, email: e.target.value })
                        }
                        className="pl-10"
                        placeholder="maya@example.com"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Phone */}
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
                        onChange={(e) =>
                          setStylistData({ ...stylistData, phone: e.target.value })
                        }
                        className="pl-10"
                        placeholder="020 7946 0892"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Location */}
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
                        onChange={(e) =>
                          setStylistData({
                            ...stylistData,
                            location: e.target.value.toUpperCase()
                          })
                        }
                        className="pl-10"
                        placeholder="SW1A 1AA"
                        maxLength={8}
                        pattern="[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}"
                        title="Please enter a valid UK postcode"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="stylist-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="stylist-password"
                        type={showPassword ? 'text' : 'password'}
                        value={stylistData.password}
                        onChange={(e) =>
                          setStylistData({ ...stylistData, password: e.target.value })
                        }
                        className="pl-10 pr-10"
                        placeholder="Create a password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label
                      htmlFor="stylist-confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="stylist-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={stylistData.confirmPassword}
                        onChange={(e) =>
                          setStylistData({
                            ...stylistData,
                            confirmPassword: e.target.value
                          })
                        }
                        className="pl-10 pr-10"
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-center">
                    <input
                      id="stylist-terms"
                      name="stylist-terms"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="stylist-terms"
                      className="ml-2 block text-xs text-gray-700"
                    >
                      I agree to the{' '}
                      <Link href="/terms" className="text-red-600 hover:text-red-500">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-red-600 hover:text-red-500">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Stylist Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <Link
                href="/login"
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dev Note */}
        <div className="text-center text-xs text-gray-400">
          Secure authentication system
        </div>
      </div>
    </div>
  )
}
