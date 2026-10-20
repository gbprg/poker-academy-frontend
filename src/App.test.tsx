import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function renderRoute(route = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('application shell', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
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

    expect(
      screen.getByRole('heading', { name: 'Poker Academy' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('API e banco conectados'),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
  })

  it('renders a direct dashboard route inside the same shell', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => undefined)))

    renderRoute('/dashboard')

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByText('Get started')).not.toBeInTheDocument()
  })

  it('shows a safe message when the backend cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')))

    renderRoute()

    expect(
      await screen.findByText('Serviço temporariamente indisponível'),
    ).toBeInTheDocument()
    expect(screen.queryByText('connection refused')).not.toBeInTheDocument()
  })
})
