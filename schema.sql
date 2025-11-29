
-- Run this in your Supabase SQL Editor

create table if not exists sites (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  author_name text,
  title text,
  html_content text,
  views integer default 0,
  published boolean default true,
  is_public boolean default true,
  allow_source_download boolean default true,
  created_at bigint,
  updated_at bigint
);

alter table sites enable row level security;

-- Policies
create policy "Public read" on sites for select using (true);
create policy "Public insert" on sites for insert with check (true);
create policy "Public update" on sites for update using (true);
