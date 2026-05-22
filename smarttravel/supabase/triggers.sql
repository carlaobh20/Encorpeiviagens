-- ============================================================
-- SmartTravel AI — Triggers automáticos
-- Execute DEPOIS do schema.sql e do policies.sql.
-- ============================================================

-- 1) Quando alguém se cadastra em auth.users, cria automaticamente
--    a linha correspondente em users_profile.
--
-- Roda como SECURITY DEFINER para conseguir gravar mesmo que a RLS
-- da tabela users_profile não tenha "permissão" no contexto do trigger.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (user_id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict do nothing;
  return new;
end;
$$;

-- Remove o trigger se já existir, depois recria.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) (opcional) backfill: cria perfil para usuários que já existem
--    em auth.users mas ainda não têm linha em users_profile.
insert into public.users_profile (user_id, full_name)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', u.email)
from auth.users u
left join public.users_profile p on p.user_id = u.id
where p.id is null;
