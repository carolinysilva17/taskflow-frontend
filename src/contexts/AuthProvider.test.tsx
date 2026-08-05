import { render, screen, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as authService from '../services/authService'
import { useAuth } from './AuthContext'
import { AuthProvider } from './AuthProvider'

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refreshSession: vi.fn(),
  logout: vi.fn(),
}))

const CAROL = { id: 1, name: 'Carol', email: 'carol@test.com' }

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth()

  return (
    <div>
      <p>isLoading: {String(isLoading)}</p>
      <p>isAuthenticated: {String(isAuthenticated)}</p>
      <p>user: {user?.email ?? 'none'}</p>
      <button onClick={() => login('carol@test.com', 'senha123')}>login</button>
      <button onClick={() => register('Carol', 'carol@test.com', 'senha123')}>register</button>
      <button onClick={() => void logout()}>logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.mocked(authService.refreshSession).mockReset()
    vi.mocked(authService.login).mockReset()
    vi.mocked(authService.register).mockReset()
    vi.mocked(authService.logout).mockReset()
  })

  it('starts as loading and applies the session when refresh succeeds', async () => {
    vi.mocked(authService.refreshSession).mockResolvedValue({ accessToken: 'token', user: CAROL })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    expect(screen.getByText('isLoading: true')).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('isLoading: false')).toBeInTheDocument())
    expect(screen.getByText('isAuthenticated: true')).toBeInTheDocument()
    expect(screen.getByText('user: carol@test.com')).toBeInTheDocument()
  })

  it('stays unauthenticated when refresh fails', async () => {
    vi.mocked(authService.refreshSession).mockRejectedValue(new Error('no session'))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByText('isLoading: false')).toBeInTheDocument())
    expect(screen.getByText('isAuthenticated: false')).toBeInTheDocument()
    expect(screen.getByText('user: none')).toBeInTheDocument()
  })

  it('login() applies the returned session', async () => {
    vi.mocked(authService.refreshSession).mockRejectedValue(new Error('no session'))
    vi.mocked(authService.login).mockResolvedValue({ accessToken: 'token', user: CAROL })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('isLoading: false')).toBeInTheDocument())

    fireEvent.click(screen.getByText('login'))

    await waitFor(() => expect(screen.getByText('isAuthenticated: true')).toBeInTheDocument())
    expect(screen.getByText('user: carol@test.com')).toBeInTheDocument()
  })

  it('register() registers and then logs in', async () => {
    vi.mocked(authService.refreshSession).mockRejectedValue(new Error('no session'))
    vi.mocked(authService.register).mockResolvedValue(undefined)
    vi.mocked(authService.login).mockResolvedValue({ accessToken: 'token', user: CAROL })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('isLoading: false')).toBeInTheDocument())

    fireEvent.click(screen.getByText('register'))

    await waitFor(() => expect(screen.getByText('isAuthenticated: true')).toBeInTheDocument())
    expect(authService.register).toHaveBeenCalledWith('Carol', 'carol@test.com', 'senha123')
    expect(authService.login).toHaveBeenCalledWith('carol@test.com', 'senha123')
  })

  it('logout() clears the session even when the API call fails', async () => {
    vi.mocked(authService.refreshSession).mockResolvedValue({ accessToken: 'token', user: CAROL })
    vi.mocked(authService.logout).mockRejectedValue(new Error('network down'))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('isAuthenticated: true')).toBeInTheDocument())

    fireEvent.click(screen.getByText('logout'))

    await waitFor(() => expect(screen.getByText('isAuthenticated: false')).toBeInTheDocument())
    expect(screen.getByText('user: none')).toBeInTheDocument()
  })
})
