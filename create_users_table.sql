-- Create a table for public profiles
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  avatar text,
  role text default 'user',
  created_at bigint,
  last_login_at bigint
);

-- Enable RLS
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone"
  on users for select
  using ( true );

create policy "Users can insert their own profile"
  on users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on users for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, created_at, last_login_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    'user',
    extract(epoch from now()) * 1000,
    extract(epoch from now()) * 1000
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
