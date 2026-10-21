import { apiRequest } from '../../lib/api/client'
import { tokenStore } from '../../lib/auth/token-store'
import {
  activateResponseSchema,
  loginResponseSchema,
  meResponseSchema,
  type SessionUser,
} from './api'

type LoginInput = { email: string; password: string }

export async function login(input: LoginInput): Promise<SessionUser> {
  const response = await apiRequest<unknown>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify(input) },
    { auth: false },
  )
  const parsed = loginResponseSchema.parse(response)
  tokenStore.set(parsed.accessToken)
  return parsed.user
}

export async function activate(token: string, password: string): Promise<SessionUser> {
  const response = await apiRequest<unknown>(
    '/api/auth/activate',
    { method: 'POST', body: JSON.stringify({ token, password }) },
    { auth: false },
  )
  return activateResponseSchema.parse(response).user
}

export async function fetchMe(): Promise<SessionUser> {
  const response = await apiRequest<unknown>('/api/auth/me')
  return meResponseSchema.parse(response).user
}

export async function logout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' })
}
