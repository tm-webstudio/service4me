"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Loader2, Eye, EyeOff, Scissors, Image, Calendar, Star } from "lucide-react"

function ConfirmContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'set-password' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const code = searchParams.get('code')
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        // New-style magic/confirmation links include `code`
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            setStatus('error')
            setMessage(error.message || 'Invalid or expired confirmation link')
            return
          }

          if (data.session) {
            setStatus('success')
            setMessage('Email confirmed! Redirecting to your dashboard...')
            const role = data.session.user?.user_metadata?.role
            const dashboardPath = role === 'stylist' ? '/dashboard/stylist' : '/dashboard/client'
            setTimeout(() => {
              router.replace(dashboardPath)
            }, 1500)
            return
          }
        }

        // Fallback for legacy token_hash links
        if (!token_hash || !type) {
          setStatus('error')
          setMessage('Invalid confirmation link')
          return
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any
        })

        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }

        if (data.user) {
          // Get the business name from user metadata
          const name = data.user.user_metadata?.business_name || ''
          setBusinessName(name)

          // Recovery links should prompt the user to set a new password
          if (type === 'recovery') {
            setStatus('set-password')
          } else {
            // Email confirmed — redirect to the appropriate dashboard
            setStatus('success')
            const role = data.user.user_metadata?.role
            const dashboardPath = role === 'stylist' ? '/dashboard/stylist' : '/dashboard/client'
            setMessage('Email confirmed! Redirecting to your dashboard...')
            setTimeout(() => {
              router.replace(dashboardPath)
            }, 1500)
          }
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    confirmEmail()
  }, [searchParams, router])

  const handleSetPassword = async () => {
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setSettingPassword(true)

    try {
      // Mark the stylist account as claimed before changing password
      // (password change can trigger auth state changes)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        if (currentUser.user_metadata?.stylist_id) {
          await supabase
            .from('stylist_profiles')
            .update({ account_claimed: true })
            .eq('id', currentUser.user_metadata.stylist_id)
        } else {
          await supabase
            .from('stylist_profiles')
            .update({ account_claimed: true })
            .eq('user_id', currentUser.id)
        }
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        setPasswordError(error.message)
        setSettingPassword(false)
        return
      }

      setStatus('success')
      setMessage('You\'re all set! Redirecting to your dashboard...')

      setTimeout(() => {
        router.replace('/dashboard/stylist')
      }, 2000)
    } catch {
      setPasswordError('An unexpected error occurred')
      setSettingPassword(false)
    }
  }

  const handleContinue = () => {
    router.push('/signup')
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your link...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="max-w-md w-full">
          <Card className="border shadow-sm">
            <CardHeader className="text-center pb-2">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">Link Expired or Invalid</h2>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 text-sm">{message}</p>
              <p className="text-gray-500 text-sm">
                This link may have expired. Please contact the Service4Me team to request a new one.
              </p>
              <Button
                onClick={handleContinue}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                Go to Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
        <div className="max-w-md w-full">
          <Card className="border shadow-sm">
            <CardHeader className="text-center pb-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">Welcome to Service4Me!</h2>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">{message}</p>
              <Button
                onClick={() => router.replace('/dashboard/stylist')}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Set password / onboarding state
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-lg w-full space-y-6">
        {/* Logo & Welcome */}
        <div className="text-center">
          <img
            src="/logo-short.svg"
            alt="Service4Me"
            className="h-5 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome{businessName ? `, ${businessName}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">
            Set your password to get started on Service4Me.
          </p>
        </div>

        {/* Password Card */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                Create a password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm password
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="h-11"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPassword && confirmPassword) {
                    handleSetPassword()
                  }
                }}
              />
            </div>
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}
            <Button
              onClick={handleSetPassword}
              disabled={settingPassword || !newPassword || !confirmPassword}
              className="w-full bg-red-600 hover:bg-red-700 h-11"
              size="lg"
            >
              {settingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                'Set Password & Get Started'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* What you can do */}
        <Card className="border shadow-sm bg-gray-50">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm font-medium text-gray-900 mb-3">Once you're in, you'll be able to:</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Scissors className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Edit your profile & services</span>
              </div>
              <div className="flex items-start gap-2">
                <Image className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Upload portfolio images</span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Manage availability</span>
              </div>
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">Respond to reviews</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
