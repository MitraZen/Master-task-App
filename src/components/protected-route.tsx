'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { PageLoading } from '@/components/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, loading])

  if (loading) {
    return <PageLoading />
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
