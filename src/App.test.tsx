import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { AuthProvider } from './features/auth/AuthContext'
import { ACCESS_TOKEN_STORAGE_KEY } from './lib/auth/token-store'

function renderRoute(route = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

const sessionUser = {
  id: 'user-1',
  name: 'Jogador Teste',
  email: 'jogador@example.com',
  role: 'USER',
  status: 'ACTIVE',
  passwordChangedAt: null,
  createdAt: '2026-10-20T00:00:00.000Z',
}

describe('application shell', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    window.localStorage.clear()
  })

  it('shows the Academy identity and checks the backend through the relative API path', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', database: 'up' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderRoute()

    expect(screen.getByRole('heading', { name: 'Poker Academy' })).toBeInTheDocument()
    expect(await screen.findByText('API e banco conectados')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
  })

  it('redirects an unauthenticated visitor from the dashboard to login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => undefined)))

    renderRoute('/dashboard')

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('renders the authenticated dashboard greeting when a valid session exists', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'valid-token')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: sessionUser }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderRoute('/dashboard')

    expect(await screen.findByRole('heading', { name: 'Olá, Jogador Teste' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )
  })

  it('clears the stored token when the session is rejected with 401', async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'stale-token')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ statusCode: 401 }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    renderRoute('/dashboard')

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('shows a safe message when the backend cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')))

    renderRoute()

    expect(await screen.findByText('Serviço temporariamente indisponível')).toBeInTheDocument()
    expect(screen.queryByText('connection refused')).not.toBeInTheDocument()
  })

  it('logs in with valid credentials, stores the token, and opens the dashboard', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockImplementation((path: string) => {
      const body =
        path === '/api/auth/me'
          ? { user: sessionUser }
          : { accessToken: 'issued-token', expiresAt: '2026-10-20T00:15:00.000Z', user: sessionUser }
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    renderRoute('/entrar')

    await user.type(screen.getByLabelText('E-mail'), sessionUser.email)
    await user.type(screen.getByLabelText('Senha'), 'private password 2026!')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Olá, Jogador Teste' })).toBeInTheDocument()
    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe('issued-token')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('shows a generic error on invalid credentials without leaking details', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ statusCode: 401 }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    renderRoute('/entrar')

    await user.type(screen.getByLabelText('E-mail'), 'nobody@example.com')
    await user.type(screen.getByLabelText('Senha'), 'wrong password')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Credenciais inválidas.')).toBeInTheDocument()
    expect(screen.queryByText('401')).not.toBeInTheDocument()
  })
})
