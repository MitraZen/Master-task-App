'use client'

import { RefreshCw } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading tasks..." />
    </div>
  )
}

export function TableLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner text="Loading tasks..." />
    </div>
  )
}
