/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const API_URL = '/api'
const STORAGE_KEY = 'rick-morty-session'

const AuthContext = createContext(null)

function getStoredSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  async function login(credentials) {
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Nao foi possivel realizar o login.')
      }

      const nextSession = { token: data.token, user: data.user }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
      setSession(nextSession)
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  async function logout() {
    if (session?.token) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      }).catch(() => {})
    }

    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  const value = {
    user: session?.user || null,
    token: session?.token || '',
    isAuthenticated: Boolean(session?.token),
    authError,
    authLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider.')
  }

  return context
}
