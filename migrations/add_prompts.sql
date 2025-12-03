-- Create prompts table
create table if not exists prompts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text not null,
  tags text[] default '{}',
  author_id text,
  author_name text,
  is_system boolean default false,
  created_at bigint default extract(epoch from now()) * 1000
);

-- Enable RLS
alter table prompts enable row level security;

-- Policies
-- Everyone can read all prompts
drop policy if exists "Public read prompts" on prompts;
create policy "Public read prompts" on prompts for select using (true);

-- Only authenticated users can insert
drop policy if exists "Authenticated insert prompts" on prompts;
create policy "Authenticated insert prompts" on prompts for insert with check (auth.role() = 'authenticated');

-- Only author or admin can delete
-- Fix: Explicitly cast IDs to text to avoid "operator does not exist: uuid = text" error
drop policy if exists "Author delete prompts" on prompts;
create policy "Author delete prompts" on prompts for delete using (
  auth.uid()::text = author_id 
  or exists (
    select 1 from users 
    where id::text = auth.uid()::text 
    and role = 'admin'
  )
);

-- Only author or admin can update
drop policy if exists "Author update prompts" on prompts;
create policy "Author update prompts" on prompts for update using (
  auth.uid()::text = author_id 
  or exists (
    select 1 from users 
    where id::text = auth.uid()::text 
    and role = 'admin'
  )
) with check (
  auth.uid()::text = author_id 
  or exists (
    select 1 from users 
    where id::text = auth.uid()::text 
    and role = 'admin'
  )
);
