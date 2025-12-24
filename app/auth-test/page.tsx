"use client"

/**
 * Auth V2 Test Page
 *
 * Test page to verify new authentication system
 * This page should be removed after testing is complete
 */

import { useState } from 'react'
import { useAuth, AuthStatus, type UserRole } from '@/lib/auth-v2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react'

/**
 * Auth State Display
 */
function AuthStateDisplay() {
  const auth = useAuth()

  const getStatusColor = (status: AuthStatus) => {
    switch (status) {
      case AuthStatus.INITIALIZING:
        return 'text-blue-600'
      case AuthStatus.AUTHENTICATED:
        return 'text-green-600'
      case AuthStatus.UNAUTHENTICATED:
        return 'text-gray-600'
      case AuthStatus.LOADING:
        return 'text-yellow-600'
      case AuthStatus.ERROR:
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: AuthStatus) => {
    switch (status) {
      case AuthStatus.INITIALIZING:
      case AuthStatus.LOADING:
        return <Loader2 className="w-5 h-5 animate-spin" />
      case AuthStatus.AUTHENTICATED:
        return <CheckCircle className="w-5 h-5" />
      case AuthStatus.UNAUTHENTICATED:
        return <User className="w-5 h-5" />
      case AuthStatus.ERROR:
        return <XCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth State</CardTitle>
        <CardDescription>Current authentication state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-3">
          <span className={getStatusColor(auth.status)}>
            {getStatusIcon(auth.status)}
          </span>
          <div>
            <p className="font-medium">Status</p>
            <p className={`text-sm ${getStatusColor(auth.status)}`}>
              {auth.status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Computed Flags */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">Authenticated</p>
            <p className="font-medium">{auth.isAuthenticated ? '✓ Yes' : '✗ No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Initializing</p>
            <p className="font-medium">{auth.isInitializing ? '✓ Yes' : '✗ No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Loading</p>
            <p className="font-medium">{auth.isLoading ? '✓ Yes' : '✗ No'}</p>
          </div>
        </div>

        {/* User Data */}
        {auth.user && (
          <div className="pt-4 border-t">
            <p className="font-medium mb-2">User Profile</p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>ID:</strong> {auth.user.id}</p>
              <p><strong>Email:</strong> {auth.user.email}</p>
              <p><strong>Name:</strong> {auth.user.fullName || 'N/A'}</p>
              <p><strong>Role:</strong> <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs uppercase">{auth.user.role}</span></p>
              <p><strong>Phone:</strong> {auth.user.phone || 'N/A'}</p>
              {auth.user.stylistProfile && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="font-medium mb-1">Stylist Profile:</p>
                  <p><strong>Business:</strong> {auth.user.stylistProfile.businessName}</p>
                  <p><strong>Location:</strong> {auth.user.stylistProfile.location}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Session Data */}
        {auth.session && (
          <div className="pt-4 border-t">
            <p className="font-medium mb-2">Session</p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Expires:</strong> {new Date(auth.session.expires_at! * 1000).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {auth.error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">{auth.error.code}</p>
              <p className="text-sm">{auth.error.message}</p>
              {auth.error.details && (
                <p className="text-xs mt-1 opacity-75">{auth.error.details}</p>
              )}
              {auth.error.recoverable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={auth.retry}
                  className="mt-2"
                >
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Sign In Form
 */
function SignInForm() {
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Test sign in functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Sign Up Form
 */
function SignUpForm() {
  const { signUp, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('client')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signUp(email, password, role, { fullName })
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Test sign up functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="newuser@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="signup-role">Role</Label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border border-gray-300 rounded-md p-2"
              disabled={isLoading}
            >
              <option value="client">Client</option>
              <option value="stylist">Stylist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing Up...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Authenticated Actions
 */
function AuthenticatedActions() {
  const { signOut, refreshProfile, isLoading, getDashboardUrl } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Test authenticated user actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={refreshProfile}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          Refresh Profile
        </Button>

        <Button
          onClick={() => window.location.href = getDashboardUrl()}
          variant="outline"
          className="w-full"
        >
          Go to Dashboard
        </Button>

        <Button
          onClick={signOut}
          variant="destructive"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Test Page Content
 */
function TestPageContent() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Initializing Auth V2...</p>
          <p className="text-gray-400 text-sm mt-2">Testing sequential initialization</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Auth V2 Test Page</h1>
          <p className="text-gray-600 mt-2">
            Testing new authentication system - Remove this page after testing
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <AuthStateDisplay />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {!isAuthenticated ? (
              <>
                <SignInForm />
                <SignUpForm />
              </>
            ) : (
              <AuthenticatedActions />
            )}
          </div>
        </div>

        {/* Testing Notes */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-900">
            <ul className="space-y-2">
              <li>✓ Check initialization (should be sequential, no race)</li>
              <li>✓ Test sign in (watch console for sequential flow)</li>
              <li>✓ Test sign out (should be instant)</li>
              <li>✓ Verify no race conditions (check console logs)</li>
              <li>✓ Test error handling (try invalid credentials)</li>
              <li>✓ Test session persistence (reload page)</li>
              <li>✓ Check loading states (should be clear)</li>
              <li>✓ Verify user data structure (check state display)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Main Test Page
 */
export default function AuthTestPage() {
  return (
      <TestPageContent />
  )
}
