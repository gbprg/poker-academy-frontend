export const ACCESS_TOKEN_STORAGE_KEY = 'poker_academy_access_token'

type Listener = () => void

const listeners = new Set<Listener>()

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export const tokenStore = {
  get(): string | null {
    return readStorage()
  },

  set(token: string): void {
    try {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
    } catch {
      // Storage may be unavailable (private mode); fail closed without throwing.
      return
    }
    notify()
  },

  clear(): void {
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    } catch {
      return
    }
    notify()
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

function notify(): void {
  for (const listener of listeners) listener()
}
