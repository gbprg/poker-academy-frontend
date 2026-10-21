import { createServer } from 'node:http'

const VALID_EMAIL = 'player@example.com'
const VALID_PASSWORD = 'private password 2026!'
const ACTIVATION_TOKEN = 'playwright-activation-token-000000000000000000'
const ACCESS_TOKEN = 'playwright-access-token'

const user = {
  id: 'user-playwright',
  name: 'Jogador Playwright',
  email: VALID_EMAIL,
  role: 'USER',
  status: 'ACTIVE',
  passwordChangedAt: null,
  createdAt: '2026-10-20T00:00:00.000Z',
}

const sessions = new Set()
let activationConsumed = false

function send(response, status, body, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', ...headers })
  response.end(body === undefined ? '' : JSON.stringify(body))
}

function readBody(request) {
  return new Promise((resolve) => {
    let raw = ''
    request.on('data', (chunk) => (raw += chunk))
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })
}

const server = createServer(async (request, response) => {
  const url = request.url ?? ''

  if (url === '/api/health' && request.method === 'GET') {
    return send(response, 200, { status: 'ok', database: 'up' })
  }

  if (url === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request)
    if (body.email === VALID_EMAIL && body.password === VALID_PASSWORD) {
      sessions.add(ACCESS_TOKEN)
      return send(response, 200, {
        accessToken: ACCESS_TOKEN,
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        user,
      })
    }
    return send(response, 401, { statusCode: 401 })
  }

  if (url === '/api/auth/activate' && request.method === 'POST') {
    const body = await readBody(request)
    if (body.token === ACTIVATION_TOKEN && !activationConsumed) {
      activationConsumed = true
      return send(response, 200, { user })
    }
    return send(response, 400, { statusCode: 400 })
  }

  if (url === '/api/auth/me' && request.method === 'GET') {
    const auth = request.headers.authorization ?? ''
    if (sessions.has(auth.replace('Bearer ', ''))) {
      return send(response, 200, { user })
    }
    return send(response, 401, { statusCode: 401 })
  }

  if (url === '/api/auth/logout' && request.method === 'POST') {
    const auth = request.headers.authorization ?? ''
    sessions.delete(auth.replace('Bearer ', ''))
    return send(response, 204)
  }

  return send(response, 404, { statusCode: 404 })
})

server.listen(4310, '127.0.0.1')

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
