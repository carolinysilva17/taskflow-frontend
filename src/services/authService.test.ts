import { describe, expect, it, vi } from 'vitest'
import { axiosError } from '../test-utils/axiosError'
import { api } from './api'
import { getAuthErrorMessage, login, logout, refreshSession, register } from './authService'

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('authService', () => {
  it('login should POST /auth/login and return the session', async () => {
    const session = { accessToken: 'token-123', user: { id: 1, name: 'Carol', email: 'carol@test.com' } }
    vi.mocked(api.post).mockResolvedValue({ data: session })

    const result = await login('carol@test.com', 'senha123')

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'carol@test.com', password: 'senha123' })
    expect(result).toEqual(session)
  })

  it('register should POST /auth/register', async () => {
    vi.mocked(api.post).mockResolvedValue({})

    await register('Carol', 'carol@test.com', 'senha123')

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Carol',
      email: 'carol@test.com',
      password: 'senha123',
    })
  })

  it('refreshSession should POST /auth/refresh and return the session', async () => {
    const session = { accessToken: 'token-456', user: { id: 1, name: 'Carol', email: 'carol@test.com' } }
    vi.mocked(api.post).mockResolvedValue({ data: session })

    const result = await refreshSession()

    expect(api.post).toHaveBeenCalledWith('/auth/refresh')
    expect(result).toEqual(session)
  })

  it('logout should POST /auth/logout', async () => {
    vi.mocked(api.post).mockResolvedValue({})

    await logout()

    expect(api.post).toHaveBeenCalledWith('/auth/logout')
  })
})

describe('getAuthErrorMessage', () => {
  it('maps INVALID_CREDENTIALS to a specific message', () => {
    expect(getAuthErrorMessage(axiosError('INVALID_CREDENTIALS'), 'fallback')).toBe(
      'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
    )
  })

  it('maps EMAIL_ALREADY_IN_USE to a specific message', () => {
    expect(getAuthErrorMessage(axiosError('EMAIL_ALREADY_IN_USE'), 'fallback')).toBe(
      'Este e-mail já está cadastrado. Tente entrar em vez de criar uma nova conta.',
    )
  })

  it('returns the fallback for unknown error codes', () => {
    expect(getAuthErrorMessage(axiosError('SOMETHING_ELSE'), 'fallback')).toBe('fallback')
  })

  it('returns the fallback for non-axios errors', () => {
    expect(getAuthErrorMessage(new Error('network down'), 'fallback')).toBe('fallback')
  })
})
