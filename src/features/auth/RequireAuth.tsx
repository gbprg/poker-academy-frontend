import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './auth-context'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isRestoring } = useAuth()
  const location = useLocation()

  if (isRestoring) {
    return (
      <main className="placeholder-page" aria-busy="true">
        <p className="eyebrow">Verificando sessão…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`
    return <Navigate to={`/entrar?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  return <>{children}</>
}
