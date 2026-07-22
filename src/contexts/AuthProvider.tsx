import { useEffect, useState, type ReactNode } from 'react'
import { api, setAccessToken } from '../services/api'
import { AuthContext, type User } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  function applySession(accessToken: string | null, sessionUser: User | null) {
    setAccessToken(accessToken)
    setUser(sessionUser)
  }

  useEffect(() => {
    api
      .post('/auth/refresh')
      .then(({ data }) => applySession(data.accessToken, data.user))
      .catch(() => applySession(null, null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    applySession(data.accessToken, data.user)
  }

  async function register(name: string, email: string, password: string) {
    await api.post('/auth/register', { name, email, password })
    await login(email, password)
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
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
