'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount
    const authStatus = localStorage.getItem('isAuthenticated')
    const savedUsername = localStorage.getItem('username')
    
    if (authStatus === 'true' && savedUsername) {
      setIsAuthenticated(true)
      setUsername(savedUsername)
    }
    setLoading(false)
  }, [])

  const login = (username: string, password: string): boolean => {
    // Get stored password or use default
    const storedPassword = localStorage.getItem('admin_password') || 'admin123'
    
    if (username === 'admin' && password === storedPassword) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('username', username)
      setIsAuthenticated(true)
      setUsername(username)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('username')
    setIsAuthenticated(false)
    setUsername(null)
    // Use window.location for more reliable redirect
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
