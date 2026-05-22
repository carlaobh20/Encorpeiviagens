-- ============================================================
-- SmartTravel AI — Migração 002: Arquitetura de Providers
-- Adiciona tabela provider_runs (log de execuções do buscador)
-- e colunas que dão suporte a Smart Score e recomendação.
-- Execute no SQL Editor do Supabase (depois de schema.sql + policies.sql + triggers.sql).
-- Idempotente: pode rodar várias vezes sem quebrar.
-- ============================================================

-- 1) Saldo manual de pontos no perfil (fallback até ter login LATAM)
alter table users_profile
  add column if not exists latam_points_balance integer not null default 0,
  add column if not exists points_updated_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- 2) Notas nas rotas
alter table monitored_routes
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

-- 3) Smart Score e recomendação nos resultados
alter table flight_search_results
  add column if not exists return_date date,
  add column if not exists passengers integer not null default 1,
  add column if not exists notes text,
  add column if not exists smart_score integer,
  add column if not exists recommendation text;

-- 4) Alerta liga no resultado que o gerou
alter table alerts
  add column if not exists result_id uuid references flight_search_results(id) on delete set null,
  add column if not exists smart_score integer;

-- 5) Provider runs — log de cada execução do buscador automático
create table if not exists provider_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route_id uuid references monitored_routes(id) on delete cascade,
  provider text not null,
  status text not null default 'running',  -- running | success | failed
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_message text,
  debug_screenshot_path text,
  results_count integer not null default 0
);

create index if not exists idx_provider_runs_user on provider_runs(user_id);
create index if not exists idx_provider_runs_route on provider_runs(route_id);
create index if not exists idx_provider_runs_started on provider_runs(started_at desc);

alter table provider_runs enable row level security;

drop policy if exists "own runs select" on provider_runs;
drop policy if exists "own runs insert" on provider_runs;
drop policy if exists "own runs update" on provider_runs;
create policy "own runs select" on provider_runs for select using (auth.uid() = user_id);
create policy "own runs insert" on provider_runs for insert with check (auth.uid() = user_id);
create policy "own runs update" on provider_runs for update using (auth.uid() = user_id);

-- 6) Trigger genérico de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_users_profile on users_profile;
create trigger set_updated_at_users_profile
  before update on users_profile
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_monitored_routes on monitored_routes;
create trigger set_updated_at_monitored_routes
  before update on monitored_routes
  for each row execute function public.set_updated_at();
