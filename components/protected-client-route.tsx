"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface ProtectedClientRouteProps {
  children: React.ReactNode
}

export function ProtectedClientRoute({ children }: ProtectedClientRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  // Check role from userProfile OR user_metadata as fallback
  const role = userProfile?.role || user?.user_metadata?.role
  const isClient = role === 'client' || !role // Default to client if no role

  useEffect(() => {
    if (!loading && user) {
      if (!isClient) {
        // User is not a client - redirect to appropriate dashboard
        if (role === 'admin') {
          router.push('/admin')
        } else if (role === 'stylist') {
          router.push('/dashboard/stylist')
        } else {
          router.push('/')
        }
      }
    } else if (!loading && !user) {
      router.push('/login?redirect=/dashboard/client')
    }
  }, [user, isClient, role, loading, router])

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

  if (!user || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}