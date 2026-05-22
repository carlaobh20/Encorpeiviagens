-- ============================================================
-- SmartTravel AI — Seed (dados de exemplo)
-- Substitua 'SEU-USER-ID' pelo id do seu usuário em auth.users
-- (pegue em Authentication > Users no painel do Supabase)
-- ============================================================

insert into users_profile (user_id, full_name) values
  ('SEU-USER-ID', 'Carlos Mendes');

insert into loyalty_accounts (user_id, provider, account_email, points_balance, session_status, last_sync_at) values
  ('SEU-USER-ID', 'latam_pass', 'carlos@email.com', 128430, 'connected', now());

insert into monitored_routes (user_id, origin, destination, departure_date, return_date, cabin, passengers, max_points, is_active, monitor_frequency) values
  ('SEU-USER-ID', 'GRU', 'MIA', '2026-09-14', '2026-09-28', 'executiva', 1, 60000, true, '5m'),
  ('SEU-USER-ID', 'GRU', 'MAD', '2026-08-12', null, 'executiva', 1, 90000, true, '5m'),
  ('SEU-USER-ID', 'GIG', 'LIS', '2026-09-03', '2026-09-20', 'economica', 2, 50000, true, '1h');
