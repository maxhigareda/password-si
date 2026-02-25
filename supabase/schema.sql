-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('admin', 'viewer')) default 'viewer',
  email text not null
);

-- RLS for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Credentials Table
create table public.credentials (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  username text not null,
  password text not null,
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Credential Shares Table
create table public.credential_shares (
  id uuid default uuid_generate_v4() primary key,
  credential_id uuid references public.credentials(id) on delete cascade not null,
  viewer_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(credential_id, viewer_id)
);

-- RLS for credentials
alter table public.credentials enable row level security;

-- Admins can do everything
create policy "Admins have full access to credentials" on credentials
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Viewers can select credentials shared with them
create policy "Viewers can read shared credentials" on credentials
  for select using (
    exists (
      select 1 from public.credential_shares 
      where credential_shares.credential_id = credentials.id 
      and credential_shares.viewer_id = auth.uid()
    )
  );

-- RLS for credential_shares
alter table public.credential_shares enable row level security;

-- Admins can manage all shares
create policy "Admins manage shares" on credential_shares
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- Viewers can only see shares assigned to them
create policy "Viewers view their shares" on credential_shares
  for select using (viewer_id = auth.uid());

-- 4. Triggers (Automatic Profile Creation)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
