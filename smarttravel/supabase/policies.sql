-- ============================================================
-- SmartTravel AI — Row Level Security (RLS)
-- Garante que cada usuário só vê/edita os próprios dados.
-- Execute DEPOIS do schema.sql.
-- ============================================================

alter table users_profile        enable row level security;
alter table loyalty_accounts      enable row level security;
alter table monitored_routes      enable row level security;
alter table flight_search_results enable row level security;
alter table alerts                enable row level security;
alter table notification_channels enable row level security;

-- Helper macro: política CRUD completa baseada em user_id = auth.uid()
-- (Supabase não tem macro, então repetimos por tabela.)

-- users_profile
create policy "own profile select" on users_profile for select using (auth.uid() = user_id);
create policy "own profile insert" on users_profile for insert with check (auth.uid() = user_id);
create policy "own profile update" on users_profile for update using (auth.uid() = user_id);
create policy "own profile delete" on users_profile for delete using (auth.uid() = user_id);

-- loyalty_accounts
create policy "own accounts select" on loyalty_accounts for select using (auth.uid() = user_id);
create policy "own accounts insert" on loyalty_accounts for insert with check (auth.uid() = user_id);
create policy "own accounts update" on loyalty_accounts for update using (auth.uid() = user_id);
create policy "own accounts delete" on loyalty_accounts for delete using (auth.uid() = user_id);

-- monitored_routes
create policy "own routes select" on monitored_routes for select using (auth.uid() = user_id);
create policy "own routes insert" on monitored_routes for insert with check (auth.uid() = user_id);
create policy "own routes update" on monitored_routes for update using (auth.uid() = user_id);
create policy "own routes delete" on monitored_routes for delete using (auth.uid() = user_id);

-- flight_search_results
create policy "own results select" on flight_search_results for select using (auth.uid() = user_id);
create policy "own results insert" on flight_search_results for insert with check (auth.uid() = user_id);

-- alerts
create policy "own alerts select" on alerts for select using (auth.uid() = user_id);
create policy "own alerts insert" on alerts for insert with check (auth.uid() = user_id);
create policy "own alerts update" on alerts for update using (auth.uid() = user_id);
create policy "own alerts delete" on alerts for delete using (auth.uid() = user_id);

-- notification_channels
create policy "own channels all" on notification_channels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- OBS: o worker usa a SERVICE ROLE KEY, que ignora RLS por padrão.
-- Por isso ele consegue ler rotas de todos os usuários para monitorar.
