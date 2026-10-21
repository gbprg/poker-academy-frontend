import { tokenStore } from '../auth/token-store'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const SAFE_MESSAGES: Record<number, string> = {
  400: 'Não foi possível concluir a solicitação.',
  401: 'Sessão expirada. Entre novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Operação não permitida no estado atual.',
  422: 'Nenhum conteúdo elegível para o filtro informado.',
  429: 'Muitas tentativas. Aguarde um instante.',
  500: 'Erro interno. Tente novamente mais tarde.',
}

function messageFor(status: number): string {
  return SAFE_MESSAGES[status] ?? 'Falha inesperada na comunicação.'
}

export async function apiRequest<T>(
  path: `/api/${string}`,
  init: RequestInit = {},
  options: { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const useAuth = options.auth ?? true
  const token = useAuth ? tokenStore.get() : null
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(path, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Serviço temporariamente indisponível')
  }

  if (response.status === 401 && useAuth) {
    tokenStore.clear()
  }

  if (!response.ok) {
    throw new ApiError(response.status, messageFor(response.status))
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
