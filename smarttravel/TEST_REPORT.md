# TEST REPORT — SmartTravel AI

> Gerado em: 2026-05-22
> Branch: `claude/sharp-hawking-vqgrd`
> Status: build verde, 33/33 testes passando

## Resumo

| Item | Status |
|---|---|
| Build de produção (`npm run build`) | OK — 17 rotas geradas |
| Type check (`tsc --noEmit`) | OK |
| Lint (`npm run lint`) | OK |
| Testes unitários (`npm run test`) | 33/33 OK |
| MockProvider determinístico | OK |
| Smart Score 0-100 | OK |
| Alert rules | OK |
| ValidateRoute | OK |

## O que foi testado

### `lib/__tests__/smartscore.test.ts` (7 testes)
- `calculateSmartScore` retorna 0 quando `current = 0`
- Score alto pra preço bem abaixo da média e mínima
- Score baixo pra preço acima da média e do orçamento
- Nunca passa de 100 nem fica negativo
- Penalidade de confiabilidade com pouquíssimas leituras
- `recommendationFromScore` mapeia faixas corretamente (90/75/55/20)
- `recommendationLabel` traduz pra português

### `lib/__tests__/alert-rules.test.ts` (6 testes)
- `evaluateAlerts` retorna `rare_opportunity` com Smart Score ≥ 85
- Retorna `lowest_ever` quando bate mínima E há histórico ≥ 2
- Ignora `lowest_ever` sem histórico suficiente
- Retorna `target_reached` quando preço ≤ max_points
- Retorna `price_drop` quando desconto ≥ 30% e meta não foi batida
- Retorna `null` quando nada dispara

### `lib/__tests__/utils.test.ts` (10 testes)
- `formatPoints` (separadores pt-BR)
- `discountPct` (0%, 50%, negativo)
- `validateRoute`: aprova rota válida
- Reprova origem com menos de 3 letras
- Reprova origem = destino
- Reprova volta antes da ida
- Reprova cabine inválida

### `lib/providers/__tests__/mock.test.ts` (10 testes)
- Identidade do provider (`name = "mock"`, `isProduction = false`)
- Sempre retorna ≥ 1 voo
- Determinístico (mesmos parâmetros = mesmos preços)
- Resultados ordenados do mais barato pro mais caro
- Preço multiplicado pelo número de passageiros
- Cabine premium gera preço maior que econômica

## Cobertura de funcionalidades

| Funcionalidade | Status |
|---|---|
| Auth completa (login/register/logout) | OK |
| Middleware de proteção de rotas | OK |
| Trigger auto-cria `users_profile` no signup | OK |
| Confirmação de e-mail via `/auth/callback` | OK |
| Dashboard com dados reais do Supabase | OK |
| Empty states em todas as telas | OK |
| Cadastro de rota (formulário manual) | OK |
| IA Gemini preenche rota a partir de texto livre | OK |
| Detalhe da rota (pausar / ativar / excluir) | OK |
| **Botão "Buscar agora" chama API real** | OK |
| **`/api/search/run` executa provider e salva** | OK |
| **`/api/worker/run` executa todas as rotas ativas** | OK |
| **`/api/provider/status` reporta provider atual** | OK |
| **Smart Score salvo em cada busca** | OK |
| **Alertas auto-gerados conforme regras** | OK |
| Histórico de preços por rota | OK |
| Tela Conta com saldo manual + provider info | OK |
| MockProvider 100% funcional | OK |
| LatamWebProvider esqueleto pronto pra iterar | OK |
| ManualProvider fallback | OK |
| Worker refatorado pra usar providers | OK |

## Pendentes (próximas fases)

| Item | Quando |
|---|---|
| Selectores reais da LATAM no `latamWebProvider` | Fase 2 |
| Login LATAM com sessão criptografada | Fase 2 |
| Worker rodando em Railway/Cron real | Fase 2 |
| Notificações push / Telegram | Fase 2 |
| Open-jaw (ida e volta por aeroportos diferentes) | Fase 2 |
| Multi-cidade (3+ trechos) | Fase 3 |
| Testes E2E com Playwright | Fase 3 |

## Bugs conhecidos

Nenhum identificado nesta versão.

## Como reproduzir

```bash
cd smarttravel
npm install
npm run test         # 33 testes
npm run build        # build verde
npm run test:report  # output detalhado
```

## Como testar manualmente

Ver `CHECKLIST_MANUAL.md`.
