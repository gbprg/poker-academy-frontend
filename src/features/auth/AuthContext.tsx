import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { tokenStore } from '../../lib/auth/token-store'
import type { SessionUser } from './api'
import { fetchMe, login as loginRequest, logout as logoutRequest } from './auth-api'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => tokenStore.get())
  const [justLoggedIn, setJustLoggedIn] = useState<SessionUser | null>(null)

  useEffect(() => tokenStore.subscribe(() => setToken(tokenStore.get())), [])

  const hasToken = Boolean(token)
  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: hasToken && !justLoggedIn,
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (me.isError) tokenStore.clear()
  }, [me.isError])

  const login = useCallback(async (email: string, password: string) => {
    const user = await loginRequest({ email, password })
    setJustLoggedIn(user)
    queryClient.setQueryData(['auth', 'me'], user)
  }, [queryClient])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      tokenStore.clear()
      setJustLoggedIn(null)
      queryClient.removeQueries({ queryKey: ['auth'] })
    }
  }, [queryClient])

  const user = justLoggedIn ?? (hasToken ? (me.data ?? null) : null)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isRestoring: hasToken && !justLoggedIn && me.isPending,
      login,
      logout,
    }),
    [user, hasToken, justLoggedIn, me.isPending, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
