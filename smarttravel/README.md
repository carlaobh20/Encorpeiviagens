# SmartTravel AI

Radar de oportunidades em pontos/milhas. Monitora rotas, identifica quedas raras, gera alertas com Smart Score.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **TailwindCSS** (design dark premium turquesa/roxo)
- **Supabase** (Postgres + Auth + RLS)
- **Playwright** (provider de busca real, opcional)
- **Gemini 2.5 Flash** (preenche rota a partir de texto livre)
- **Vitest** (testes unitários)

## Versão atual: arquitetura de providers

O SmartTravel busca voos em pontos via uma camada de **providers** plugáveis. Mude o provider sem mexer no resto do app, só trocando uma env.

| Provider | Status | Quando usar |
|---|---|---|
| `mock` | Pronto | Default. Dados simulados realistas. App funciona ponta a ponta. |
| `latam_api` | Iteração | HTTP direto no BFF da LATAM. **Roda em Vercel/serverless**. |
| `latam_web` | Iteração | Playwright no site público da LATAM. Precisa Chromium (Railway/Render/EC2). |
| `latam` | Iteração | Orquestrador: tenta `api`, cai pro `web` se vazio (via `LATAM_MODE`). |
| `manual` | Fallback | Não busca; espera entrada manual de preço. |

Configure com a env `AWARD_PROVIDER`:

```bash
AWARD_PROVIDER=mock        # default em dev
AWARD_PROVIDER=latam_api   # produção em Vercel (HTTP direto)
AWARD_PROVIDER=latam_web   # produção fora da Vercel (Playwright)
AWARD_PROVIDER=latam       # auto (api → fallback browser); LATAM_MODE=api|browser|auto
AWARD_PROVIDER=manual      # fallback sem busca
```

**Testando o LATAM sem afetar o banco** — `POST /api/provider/probe` dispara
a busca no provider atual e retorna o payload bruto:

```bash
curl -X POST https://seu-app.vercel.app/api/provider/probe \
  -H 'content-type: application/json' \
  -b 'sb-access-token=...' \
  -d '{"origin":"GRU","destination":"LIS","departureDate":"2026-08-15","cabin":"executiva","passengers":1}'
```

Use `LATAM_DEBUG=true` pra logar o JSON bruto da LATAM no console (Vercel logs).

## Setup local

```bash
# 1. dependências
npm install

# 2. variáveis de ambiente
cp .env.example .env.local
# edite com suas chaves do Supabase + Gemini

# 3. banco
# rode no SQL Editor do Supabase, NA ORDEM:
# - supabase/schema.sql
# - supabase/policies.sql
# - supabase/triggers.sql
# - supabase/migrations_002_providers.sql

# 4. dev
npm run dev
```

## Comandos

```bash
npm run dev          # servidor de desenvolvimento (http://localhost:3000)
npm run build        # build de produção
npm run start        # servidor em produção
npm run lint         # ESLint
npm run test         # vitest, uma rodada
npm run test:watch   # vitest, modo watch
npm run test:report  # vitest, output verboso
npm run worker       # roda o worker uma vez (usa AWARD_PROVIDER)
```

## Arquitetura

```
app/
  api/
    search/run/       POST { routeId } -> executa busca de UMA rota
    worker/run/       POST -> executa busca de TODAS as rotas ativas
    provider/status/  GET -> mostra provider atual
  auth/               callback e signout
  dashboard/          telas autenticadas
  monitoramentos/
  alertas/
  historico/
  conta/
  login/  register/

lib/
  providers/          camada de buscadores plugaveis
    types.ts            interface FlightAwardProvider
    mock.ts             provider de demo (default)
    latam-web.ts        provider real com Playwright
    manual.ts           fallback sem busca
    index.ts            factory getAwardProvider()
  search-engine.ts    orquestra provider + persistencia + alertas
  smartscore.ts       calculo do Smart Score 0-100
  alert-rules.ts      regras pra gerar alertas
  gemini.ts           cliente Gemini (preenchimento de rota por texto)
  auth.ts             requireUser() pra Server Components

server/workers/
  monitor.ts          worker pra rodar fora da Vercel (Railway, cron, etc.)

supabase/
  schema.sql          tabelas
  policies.sql        Row Level Security
  triggers.sql        auto-criar perfil no signup
  migrations_002_providers.sql  Smart Score, provider_runs, saldo manual
```

## Como funciona uma busca

1. Usuário clica em **Buscar agora** em uma rota.
2. Front chama `POST /api/search/run` com `routeId`.
3. `search-engine.runRouteSearch()`:
   - Cria um `provider_runs` com status `running`.
   - Chama `getAwardProvider()` que executa `searchAwardFlights`.
   - Salva resultados em `flight_search_results`.
   - Calcula Smart Score e recomendação no mais barato.
   - Avalia regras de alerta (`evaluateAlerts`).
   - Insere `alerts` se houver oportunidade.
   - Fecha o `provider_runs` com status `success` (ou `failed` se quebrou).
4. Front recebe `{ status, bestPrice, alertCreated }` e atualiza a tela.

## Smart Score (0-100)

Pondera 5 criterios:

- **40 pts** desconto vs media historica
- **25 pts** proximidade da minima ja registrada
- **15 pts** cabe no orcamento (max_points)
- **10 pts** bonus de cabine premium
- **10 pts** proximidade da data de viagem

Faixas:

- **85+** oportunidade rara -> "Comprar agora"
- **70-84** "Boa oportunidade"
- **50-69** "Continuar monitorando"
- **<50** "Preco acima da media"

## Tipos de alerta

| Tipo | Quando dispara |
|---|---|
| `rare_opportunity` | Smart Score >= 85 |
| `lowest_ever` | preco atual < minima historica |
| `target_reached` | preco <= `max_points` da rota |
| `price_drop` | desconto >= 30% vs media |
| `below_average` | desconto >= 20% vs media |

## Worker / Cron

```bash
# rodar local
npm run worker

# em producao
# - Railway/Render: configure como cron job chamando este script
# - GitHub Actions: workflow agendado (free)
# - Vercel Cron: chama POST /api/worker/run com header x-worker-secret
```

## Login LATAM (fase 2)

Por enquanto a busca usa a pagina publica (sem login). Sessao logada sera adicionada
quando o `latamWebProvider` estiver estavel.

## Tela Conta

- **Saldo manual** (opcional): so pra acompanhar visualmente, nao afeta as buscas
- **Provider atual**: mostra qual buscador esta configurado
- **Logout**

## Visual

Design dark premium, mobile-first, com paleta turquesa (`#5EEAD4`) / azul (`#38BDF8`) / roxo (`#7C3AED`) /
verde oportunidade (`#22C55E`). Componentes em `components/`.

## Privacidade

- Sem senha LATAM
- RLS no Supabase isola dados por usuario
- Cookies de sessao via `@supabase/ssr`
- Middleware refresca sessao e protege rotas privadas
