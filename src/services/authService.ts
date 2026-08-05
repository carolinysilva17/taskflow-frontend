import { api } from './api'
import { createErrorMessageResolver } from '../utils/createErrorMessageResolver'

export type User = {
  id: number
  name: string
  email: string
}

export type AuthSession = {
  accessToken: string
  user: User
}

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'EMAIL_ALREADY_IN_USE'

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
  EMAIL_ALREADY_IN_USE: 'Este e-mail já está cadastrado. Tente entrar em vez de criar uma nova conta.',
}

export const getAuthErrorMessage = createErrorMessageResolver(AUTH_ERROR_MESSAGES)

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthSession>('/auth/login', { email, password })
  return data
}

export async function register(name: string, email: string, password: string) {
  await api.post('/auth/register', { name, email, password })
}

export async function refreshSession() {
  const { data } = await api.post<AuthSession>('/auth/refresh')
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}
