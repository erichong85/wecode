
-- Run this in your Supabase SQL Editor to fix the missing column

alter table sites add column if not exists allow_source_download boolean default true;
alter table sites add column if not exists author_name text;
alter table sites add column if not exists title text;
alter table sites add column if not exists html_content text;
alter table sites add column if not exists views integer default 0;
alter table sites add column if not exists published boolean default true;
alter table sites add column if not exists is_public boolean default true;
alter table sites add column if not exists created_at bigint;
alter table sites add column if not exists updated_at bigint;

-- Force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';
