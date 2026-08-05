import { useEffect, useState, type ReactNode } from 'react'
import { setAccessToken } from '../services/api'
import * as authService from '../services/authService'
import { AuthContext, type User } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  function applySession(accessToken: string | null, sessionUser: User | null) {
    setAccessToken(accessToken)
    setUser(sessionUser)
  }

  useEffect(() => {
    authService
      .refreshSession()
      .then((session) => applySession(session.accessToken, session.user))
      .catch(() => applySession(null, null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const session = await authService.login(email, password)
    applySession(session.accessToken, session.user)
  }

  async function register(name: string, email: string, password: string) {
    await authService.register(name, email, password)
    await login(email, password)
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      // A sessão local é sempre encerrada, mesmo se a chamada ao servidor falhar.
    } finally {
      applySession(null, null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
