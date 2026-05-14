"use client"

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useClientAvatarUpload } from '@/hooks/use-client-avatar-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon,
  Mail as MailIcon
} from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  const { signUp, isLoading, error: authError, getDashboardUrl } = useAuth()
  const { validateFile } = useClientAvatarUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [isProfileDragOver, setIsProfileDragOver] = useState(false)

  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

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

  const handleClientSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')

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
      await signUp(clientData.email, clientData.password, 'client', {
        fullName: `${clientData.firstName} ${clientData.lastName}`.trim()
      })

      console.log('[SIGNUP-FORM] Client signup successful')

      const dashboardUrl = getDashboardUrl()

      if (dashboardUrl === '/login') {
        setSuccessEmail(clientData.email)
        setSignupSuccess(true)
      } else {
        if (profileImage) {
          console.log('[SIGNUP-FORM] Profile image upload will be handled in dashboard')
        }

        console.log('[SIGNUP-FORM] Redirecting to:', dashboardUrl)
        router.push(dashboardUrl)
      }
    } catch (error: any) {
      console.error('[SIGNUP-FORM] Client signup failed:', error)
    }
  }

  const displayError = authError?.message || localError

  if (signupSuccess) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <MailIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Confirm Your Email to Finish Signing Up
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a confirmation link to{' '}
                  <strong>{successEmail}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Open the email and click the link to activate your account.
                </p>
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 mb-6 text-left">
                  <p className="text-sm text-yellow-900">
                    <strong>Don't see it?</strong> Check your spam or junk folder. The email
                    can take a few minutes to arrive.
                  </p>
                </div>
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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
            Create Your Client Account
          </h2>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Join the Service4Me community
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center text-lg">Client Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {displayError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleClientSubmit} className="space-y-4">
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
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <Link
                href="/login"
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-2 text-center">
              <span className="text-sm text-gray-600">Are you a stylist? </span>
              <Link
                href="/list-business"
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                List your business
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
