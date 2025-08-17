"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface ProtectedStylistRouteProps {
  children: React.ReactNode
}

export function ProtectedStylistRoute({ children }: ProtectedStylistRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in - redirect to login
        router.push('/login?redirect=/dashboard/stylist')
        return
      }
      
      if (userProfile?.role !== 'stylist') {
        // User is not a stylist - redirect to appropriate dashboard or home
        if (userProfile?.role === 'client') {
          router.push('/dashboard/client')
        } else {
          router.push('/')
        }
        return
      }
    }
  }, [user, userProfile, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!user || userProfile?.role !== 'stylist') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // User is authenticated and is a stylist - show the protected content
  return <>{children}</>
}