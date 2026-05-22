-- ============================================================
-- SmartTravel AI — Schema do banco (Supabase / PostgreSQL)
-- Execute no SQL Editor do Supabase (cole tudo e clique em RUN)
-- ============================================================

-- Perfil do usuário (1:1 com auth.users)
create table if not exists users_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Contas de fidelidade conectadas
create table if not exists loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'latam_pass',
  account_email text,
  points_balance integer not null default 0,
  encrypted_session text,            -- sessão/cookies CRIPTOGRAFADOS (nunca senha em texto puro)
  session_status text not null default 'not_connected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

-- Rotas monitoradas
create table if not exists monitored_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'latam_pass',
  origin text not null,
  destination text not null,
  departure_date date not null,
  return_date date,
  cabin text not null default 'economica',
  passengers integer not null default 1,
  max_points integer,
  is_active boolean not null default true,
  monitor_frequency text not null default '1h',
  created_at timestamptz not null default now()
);

-- Resultados de busca (histórico de preços)
create table if not exists flight_search_results (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references monitored_routes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'latam_pass',
  origin text not null,
  destination text not null,
  departure_date date not null,
  cabin text not null,
  points_price integer not null,
  cash_taxes numeric(10,2) default 0,
  flight_number text,
  departure_time text,
  arrival_time text,
  airline text,
  booking_url text,
  raw_payload jsonb,
  captured_at timestamptz not null default now()
);

-- Alertas gerados
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route_id uuid references monitored_routes(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  points_price integer,
  threshold_points integer,
  discount_percentage integer default 0,
  status text not null default 'new',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Canais de notificação
create table if not exists notification_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,                -- push | telegram | email | whatsapp
  value text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists idx_routes_user on monitored_routes(user_id);
create index if not exists idx_routes_active on monitored_routes(is_active);
create index if not exists idx_results_route on flight_search_results(route_id);
create index if not exists idx_alerts_user on alerts(user_id);
