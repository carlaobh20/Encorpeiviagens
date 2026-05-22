# CHECKLIST MANUAL — SmartTravel AI

Roteiro pra validar que o app funciona ponta a ponta após cada deploy.

## Pré-requisitos no Supabase

- [ ] SQL `schema.sql` rodado
- [ ] SQL `policies.sql` rodado
- [ ] SQL `triggers.sql` rodado
- [ ] SQL `migrations_002_providers.sql` rodado
- [ ] Authentication → Email → "Confirm email" **desligado** (modo teste)
- [ ] Authentication → URL Configuration → Site URL e Redirect URLs setadas

## Pré-requisitos na Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `GEMINI_API_KEY`
- [ ] `AWARD_PROVIDER=mock` (até `latam_web` estar pronto)
- [ ] Último deploy verde

## Fluxo do usuário

### 1. Cadastro
- [ ] Acessa `/register`
- [ ] Preenche nome, e-mail, senha (6+ chars)
- [ ] Clica em "Criar conta"
- [ ] É redirecionado pra `/dashboard` (sem precisar confirmar e-mail)
- [ ] No Supabase Table Editor `users_profile` aparece 1 linha com o nome

### 2. Login / Logout
- [ ] Abre `/conta` → clica em "Sair da conta" → volta pra `/login`
- [ ] Loga novamente com o mesmo e-mail/senha
- [ ] Tenta acessar `/login` já logado → redireciona pra `/dashboard`
- [ ] Tenta acessar `/dashboard` deslogado → redireciona pra `/login`

### 3. Saldo manual
- [ ] Vai em `/conta`
- [ ] Digita 50000 no campo de saldo → clica em "Salvar"
- [ ] Vai pro `/dashboard` → card LATAM Pass mostra `50.000 pts`

### 4. Criar rota (formulário manual)
- [ ] `/monitoramentos` → "+ Nova rota monitorada"
- [ ] Preenche: GRU → MIA, data futura, executiva, 1 pax, meta 60000
- [ ] Clica em "Criar rota"
- [ ] Cai na lista com a rota cadastrada

### 5. Criar rota (IA)
- [ ] Em `/monitoramentos/nova`, digita: "Rio para Lisboa em julho 2026, executiva, máximo 200k pts"
- [ ] Clica em "✨ Preencher com IA"
- [ ] Em 2-3s os campos se preenchem (GIG → LIS, julho/2026, executiva, etc.)
- [ ] Aparece texto verde "Entendi: ..."
- [ ] Clica em "Criar rota" → salva no banco

### 6. Buscar agora (provider mock)
- [ ] Abre uma rota cadastrada → tela de detalhes
- [ ] Clica em "🛰 Buscar agora"
- [ ] Em 1-2s aparece mensagem verde "Encontrou X voo(s). Melhor preço: Y pts..."
- [ ] Tela atualiza mostrando o card "Última busca" com preço, Smart Score e recomendação
- [ ] Botão "Ver histórico de preços (N)" aparece

### 7. Histórico
- [ ] Clica no botão de histórico ou vai em `/historico`
- [ ] Gráfico renderiza com pelo menos 1 ponto
- [ ] Cards de menor / média / maior / leituras aparecem com valores reais

### 8. Alertas
- [ ] Clica em "Buscar agora" várias vezes na mesma rota (cada busca varia preço)
- [ ] Em algum momento dispara um alerta (Smart Score ≥ 85, ou meta atingida, ou queda forte)
- [ ] Vai em `/alertas` → o alerta aparece
- [ ] Clica em "Salvar" → status muda
- [ ] Clica em "Ignorar" → some da lista (filtramos ignored)

### 9. Pausar / ativar / excluir rota
- [ ] No detalhe da rota → "Pausar" → ponto da rota fica cinza
- [ ] "Ativar" → ponto fica colorido de novo
- [ ] "Excluir rota" → volta pra lista sem a rota

### 10. Edge cases
- [ ] Origem e destino iguais → erro de validação
- [ ] Volta antes da ida → erro de validação
- [ ] Origem com 2 letras → erro de validação
- [ ] Buscar agora sem internet → mensagem de erro visível

## API direta (cURL pra teste)

```bash
# 1. status do provider
curl https://SEU-APP.vercel.app/api/provider/status
# -> { name: "mock", label: "Mock (demonstração)", isProduction: false }

# 2. buscar uma rota (precisa estar logado, usar cookie de sessão)
curl -X POST https://SEU-APP.vercel.app/api/search/run \
  -H "Content-Type: application/json" \
  -b "sb-access-token=..." \
  -d '{"routeId":"UUID-DA-ROTA"}'

# 3. rodar worker (precisa do WORKER_SECRET)
curl -X POST https://SEU-APP.vercel.app/api/worker/run \
  -H "x-worker-secret: SEU_SEGREDO"
```

## Critério de aceite

Tudo acima passando = MVP automático com providers entregue.
