import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../../lib/api/client'

type HealthResponse = { status: 'ok'; database: 'up' }

export function SystemStatus() {
  const health = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => apiRequest<HealthResponse>('/api/health'),
  })

  if (health.isPending) {
    return <p className="system-status system-status--pending">Verificando serviços…</p>
  }

  if (health.isError) {
    return <p className="system-status system-status--error">Serviço temporariamente indisponível</p>
  }

  return (
    <p className="system-status system-status--online">
      <span aria-hidden="true" /> API e banco conectados
    </p>
  )
}
