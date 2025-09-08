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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/dashboard/client')
        return
      }
      
      if (userProfile?.role && userProfile.role !== 'client') {
        if (userProfile.role === 'admin') {
          router.push('/admin')
        } else if (userProfile.role === 'stylist') {
          router.push('/dashboard/stylist')
        } else {
          router.push('/')
        }
        return
      }
    }
  }, [user, userProfile, loading, router])

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

  if (!user || (userProfile?.role && userProfile.role !== 'client')) {
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