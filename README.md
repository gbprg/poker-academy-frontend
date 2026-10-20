# Poker Academy — frontend

SPA React/Vite da Poker Academy. O navegador acessa o backend apenas por caminhos relativos sob `/api`; nenhum segredo deve ser exposto em variáveis `VITE_*`.

## Requisitos

- Node.js 22.23.1
- npm 12.2.0
- backend local em `http://localhost:3000` (para integração real)

## Desenvolvimento

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`VITE_DEV_API_TARGET` configura somente o alvo do proxy do servidor Vite. Essa variável não é consumida pelo código entregue ao navegador.

## Verificação

```bash
npm test
npm run test:e2e
npm run lint
npm run build
npm audit --audit-level=high
```

O E2E inicia uma API descartável e comprova o deep link da SPA e a precedência do proxy `/api`.

## Vercel

`vercel.json.template` registra a ordem obrigatória dos rewrites: `/api` antes do fallback da SPA. A P01-T05 deve copiar o template para o `vercel.json` ignorado, substituir `REPLACE_WITH_RENDER_HOST` pela URL HTTPS realmente provisionada no Render e então validar o preview. O placeholder não é implantável.
