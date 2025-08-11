"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

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
          setStatus('success')
          setMessage('Email confirmed successfully! You can now sign in.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleContinue = () => {
    if (status === 'success') {
      router.push('/login')
    } else {
      router.push('/signup')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'loading' && <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
              {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{message}</p>
            
            {status !== 'loading' && (
              <Button 
                onClick={handleContinue}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {status === 'success' ? 'Continue to Sign In' : 'Back to Sign Up'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}