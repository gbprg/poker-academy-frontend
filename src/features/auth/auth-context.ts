import { createContext, useContext } from 'react'
import type { SessionUser } from './api'

export type AuthContextValue = {
  user: SessionUser | null
  isAuthenticated: boolean
  isRestoring: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
