-- ============================================
-- SPLITSKI DATABASE SCHEMA
-- Run this in Supabase SQL Editor (one shot)
-- ============================================

-- Drop existing (only if re-running)
drop table if exists requests cascade;
drop table if exists quests cascade;
drop table if exists profiles cascade;

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  neighborhood text default 'Manuš',
  points int default 0,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- ============================================
-- QUESTS
-- ============================================
create table quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text default 'ti-paw',
  points int default 50,
  proof_type text default 'photo' check (proof_type in ('photo', 'qr')),
  qr_method text check (qr_method in ('auto', 'event', 'organizer')),
  qr_data text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- REQUESTS (quest submissions)
-- ============================================
create table requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  quest_id uuid not null references quests(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  photo_url text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_requests_status on requests(status);
create index idx_requests_user on requests(user_id);
create index idx_profiles_points on profiles(points desc);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- APPROVE REQUEST (atomic: adds points + updates status)
-- ============================================
create or replace function approve_request(req_id uuid)
returns void as $$
declare
  v_user uuid;
  v_pts int;
begin
  select r.user_id, q.points into v_user, v_pts
  from requests r join quests q on q.id = r.quest_id
  where r.id = req_id and r.status = 'pending';

  if v_user is null then raise exception 'Request not found or not pending'; end if;

  update requests
    set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where id = req_id;

  update profiles set points = points + v_pts where id = v_user;
end;
$$ language plpgsql security definer;

-- ============================================
-- REJECT REQUEST
-- ============================================
create or replace function reject_request(req_id uuid)
returns void as $$
begin
  update requests
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
    where id = req_id and status = 'pending';
end;
$$ language plpgsql security definer;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table quests enable row level security;
alter table requests enable row level security;

-- Profiles: read all, update own
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Quests: read all, only admin write
create policy "quests_read_all" on quests for select using (true);
create policy "quests_admin_write" on quests for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Requests: read own + admin reads all; insert own; admin updates
create policy "requests_read_own_or_admin" on requests for select using (
  auth.uid() = user_id
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "requests_insert_own" on requests for insert with check (auth.uid() = user_id);
create policy "requests_admin_update" on requests for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- STORAGE BUCKET FOR PHOTOS
-- ============================================
insert into storage.buckets (id, name, public)
values ('proof-photos', 'proof-photos', true)
on conflict (id) do nothing;

create policy "photos_public_read" on storage.objects for select
  using (bucket_id = 'proof-photos');

create policy "photos_user_upload" on storage.objects for insert
  with check (bucket_id = 'proof-photos' and auth.uid() is not null);

-- ============================================
-- SEED DATA
-- ============================================
insert into quests (title, description, icon, points, proof_type) values
  ('Photo a pothole nearby', 'Pin it on the map for the city', 'ti-camera', 50, 'photo'),
  ('Coffee at a local konoba', 'Skip the chains, support Split', 'ti-coffee', 40, 'photo'),
  ('Shop at Pazar market', 'Photo your produce or receipt', 'ti-shopping-bag', 45, 'photo'),
  ('Bačvice beach cleanup', 'Organizer scans your QR at the event', 'ti-wave-saw-tool', 120, 'qr'),
  ('Help an elderly neighbor', 'Groceries, errands, or just talk', 'ti-heart-handshake', 80, 'photo'),
  ('Take the Promet bus today', 'Leave the car, reduce traffic', 'ti-bus', 40, 'photo');
