'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { showToast } from '@/components/toast'

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // For now, we'll allow password reset for admin user
      // In a real app, you'd verify the user exists and send a reset email
      if (username === 'admin') {
        setStep('reset')
        showToast.success('User verified. Please set your new password.')
      } else {
        setError('User not found. Please check your username.')
        showToast.error('User not found')
      }
    } catch (err) {
      setError('An error occurred during verification')
      showToast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      showToast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      showToast.error('Password too short')
      return
    }

    setLoading(true)

    try {
      // Store the new password in localStorage
      // In a real app, you'd send this to your backend
      localStorage.setItem('admin_password', newPassword)
      
      showToast.success('Password reset successfully!')
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } catch (err) {
      setError('An error occurred during password reset')
      showToast.error('Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === 'verify' ? 'Forgot Password' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {step === 'verify' 
              ? 'Enter your username to verify your account'
              : 'Set your new password'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 'verify' ? (
            <form onSubmit={handleVerifyUser} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify User'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline flex items-center justify-center gap-1"
              disabled={loading}
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
