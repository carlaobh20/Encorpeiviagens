# 🛫 SmartTravel AI

Plataforma premium de inteligência em passagens aéreas por pontos/milhas (LATAM Pass).
Monitora rotas, detecta quedas raras de preço em pontos e envia alertas automáticos.

> **Stack:** Next.js 15 · TypeScript · TailwindCSS · Supabase · PWA · Worker Playwright · Telegram

---

## 📁 O que tem neste projeto

```
app/            -> as telas (dashboard, alertas, conta, landing, login...)
components/     -> peças reutilizáveis (cards, botões, gráficos, navegação)
lib/            -> tipos, utilidades, cliente Supabase, Smart Score, alertas
server/workers/ -> o "robô" que vigia os preços (Playwright)
supabase/       -> schema.sql, policies.sql, seed.sql para o banco
public/         -> manifest PWA, ícones, service worker
```

Hoje o app já **roda com dados de exemplo (mock)**. Você consegue ver tudo funcionando
antes mesmo de configurar o Supabase. Depois é só plugar o banco real.

---

## ✅ Pré-requisitos (instale uma vez)

Você é iniciante? Sem problema. Instale estes dois programas no seu computador:

1. **Node.js** (versão 20 ou maior) → https://nodejs.org (baixe o "LTS" e clique em avançar/avançar).
2. **Git** → https://git-scm.com/downloads
3. Crie contas grátis em: **GitHub**, **Supabase** e **Vercel** (pode entrar com o GitHub nos três).

Para testar se funcionou, abra o Terminal (Mac) ou Prompt de Comando (Windows) e digite:

```bash
node -v    # deve mostrar algo como v20.x
git --version
```

---

## ▶️ PARTE 1 — Rodar no seu computador (5 minutos)

1. Descompacte o projeto numa pasta.
2. Abra o Terminal **dentro dessa pasta** e rode:

```bash
npm install        # baixa as dependências (demora 1-2 min)
npm run dev        # liga o site localmente
```

3. Abra no navegador: **http://localhost:3000** (landing) e **http://localhost:3000/dashboard** (o app).

Pronto — já está vendo o produto com dados de exemplo. 🎉

---

## 🐙 PARTE 2 — Colocar o código no GitHub

> O GitHub guarda seu código na nuvem. A Vercel vai ler dele para publicar o site.

1. Crie um repositório novo em https://github.com/new
   - Nome: `smarttravel-ai`
   - Deixe **vazio** (sem README, sem .gitignore — já temos).
   - Clique em **Create repository**.
2. No Terminal, dentro da pasta do projeto, rode (troque `SEU-USUARIO`):

```bash
git init
git add .
git commit -m "primeiro commit do SmartTravel AI"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/smarttravel-ai.git
git push -u origin main
```

> Se pedir login, use seu usuário do GitHub. (Em alguns casos o GitHub pede um "token"
> no lugar da senha — siga as instruções na tela; é normal.)

Atualize a página do GitHub: seus arquivos devem aparecer lá.

---

## 🗄️ PARTE 3 — Criar o banco no Supabase

1. Acesse https://supabase.com → **New project**.
   - Dê um nome, escolha uma senha forte para o banco e a região mais próxima (ex.: São Paulo).
   - Espere ~2 minutos enquanto ele cria.
2. No menu lateral, vá em **SQL Editor** → **New query**.
3. Abra o arquivo `supabase/schema.sql`, **copie tudo**, cole no editor e clique em **RUN**.
4. Faça o mesmo com `supabase/policies.sql` (cria a segurança por usuário).
5. (Opcional) Crie um usuário de teste em **Authentication → Users → Add user**,
   copie o `id` dele, cole no lugar de `SEU-USER-ID` dentro de `supabase/seed.sql`,
   e rode o seed para ter dados de exemplo reais.
6. Pegue suas chaves em **Project Settings → API**. Você vai precisar de:
   - **Project URL**
   - **anon public key**
   - **service_role key** (essa é secreta — use só no worker)

---

## 🔑 PARTE 4 — Variáveis de ambiente

Crie um arquivo chamado `.env.local` na raiz do projeto (copie de `.env.example`)
e preencha com as chaves do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ENCRYPTION_SECRET=  # gere com: openssl rand -base64 32
TELEGRAM_BOT_TOKEN= # crie um bot com @BotFather no Telegram
TELEGRAM_CHAT_ID=   # seu id de chat
```

> **Nunca** suba o `.env.local` para o GitHub (ele já está no `.gitignore`).

---

## 🚀 PARTE 5 — Publicar na Vercel

1. Acesse https://vercel.com → **Add New → Project**.
2. Conecte sua conta GitHub e selecione o repositório `smarttravel-ai`.
3. Em **Environment Variables**, adicione as mesmas chaves do `.env.local`
   (uma por uma: nome e valor).
4. Clique em **Deploy**. Em ~2 minutos seu site estará no ar com um link público. 🌎

A partir daí, **todo `git push` republicará o site automaticamente**.

---

## 🤖 PARTE 6 — O robô (worker)

O robô que vigia os preços roda **separado** do site (para não dormir junto com ele).
Hospede em **Railway**, **Render** ou **Fly.io**, ou rode num cron.

Para testar localmente:

```bash
npm run worker
```

> ⚠️ **Importante sobre o scraping da LATAM:** o arquivo `lib/latam.ts` tem a função
> `searchLatamPoints()` com um **comentário grande marcando exatamente onde implementar
> o scraping real**. Hoje ela retorna `null` (mock). O site da LATAM muda com frequência,
> por isso essa parte foi isolada — você ajusta só ali, sem mexer no resto.

---

## 🔐 Sobre segurança e a conta LATAM (leia com atenção)

- **Nunca** salvamos a senha da LATAM. O usuário faz login manualmente; guardamos
  apenas a **sessão criptografada** (`lib/crypto.ts`), e ele pode desconectar/apagar.
- A tela **Conta** já oferece as duas opções: usar como visitante OU conectar a conta.
- ⚠️ **Aviso honesto:** automatizar acesso/scraping de contas LATAM provavelmente
  **fere os Termos de Uso** deles e pode causar **bloqueio da conta** do usuário.
  Valide isso com um advogado antes de ir a produção. O código deixa a estrutura pronta,
  mas a decisão e o risco são seus.

---

## 🧭 Resumo do fluxo

```
Você → GitHub → Vercel (site no ar)
                  ↑
            Supabase (banco + login)
                  ↑
            Worker (robô) → busca preços → gera alerta → Telegram
```

Qualquer dúvida, me chame que a gente ajusta um passo de cada vez. 🚀
