import { createServer } from 'node:http'

const server = createServer((request, response) => {
  if (request.url === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ status: 'ok', database: 'up' }))
    return
  }

  response.writeHead(404, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ statusCode: 404 }))
})

server.listen(4310, '127.0.0.1')

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
