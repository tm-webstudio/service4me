"use client"

/**
 * Login Form - V2
 *
 * New login form using auth-v2 system
 * Features:
 * - Uses new auth context
 * - Clear error handling
 * - Proper loading states
 * - Role-based redirects
 * - No race conditions
 */

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-v2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

export function LoginFormV2() {
  const router = useRouter()
  const { signIn, isLoading, error: authError, getDashboardUrl } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')

    // Validation
    if (!email || !password) {
      setLocalError('Please enter both email and password')
      return
    }

    console.log('[LOGIN-FORM-V2] Submitting login for:', email)

    try {
      // Sign in using auth-v2
      await signIn(email, password)

      console.log('[LOGIN-FORM-V2] Sign in successful, redirecting...')

      // Get dashboard URL based on user role
      const dashboardUrl = getDashboardUrl()
      console.log('[LOGIN-FORM-V2] Redirecting to:', dashboardUrl)

      // Redirect to dashboard
      router.push(dashboardUrl)
    } catch (error: any) {
      console.error('[LOGIN-FORM-V2] Sign in failed:', error)
      // Error is already set in auth context
      // Just log it here for debugging
    }
  }

  // Display error (prefer auth error over local error)
  const displayError = authError?.message || localError

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Sign in to your Service4Me account
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center text-lg">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Error Display */}
            {displayError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            {/* Auth Error with Retry */}
            {authError && authError.recoverable && (
              <div className="mb-4 text-sm text-gray-600">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Retry
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  href="/forgot-password"
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account?{' '}
                </span>
                <Link
                  href="/signup-v2"
                  className="text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dev Note */}
        <div className="text-center text-xs text-gray-400">
          Auth V2 - New authentication system
        </div>
      </div>
    </div>
  )
}
