-- Run this in Supabase SQL Editor to sync existing users

insert into public.users (id, email, name, role, created_at, last_login_at)
select 
  id, 
  email, 
  -- Use name from metadata, or fallback to email prefix
  coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)), 
  -- Auto-assign admin role if email starts with 'admin'
  case when email like 'admin%' then 'admin' else 'user' end, 
  extract(epoch from created_at) * 1000, 
  extract(epoch from last_sign_in_at) * 1000
from auth.users
on conflict (id) do update
set 
  email = excluded.email,
  last_login_at = excluded.last_login_at,
  role = excluded.role;

-- Confirm the count
select count(*) as "Synced Users Count" from public.users;
