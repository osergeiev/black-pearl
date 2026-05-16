-- ============================================
-- SPLITSKI DATABASE SCHEMA
-- Run this in Supabase SQL Editor (one shot)
-- ============================================

-- Drop existing (only if re-running)
drop table if exists redemptions cascade;
drop table if exists rewards cascade;
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
  total_earned int default 0,
  streak int default 0,
  last_submission_date date,
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
  image_url text,
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
-- REWARDS (admin-managed catalog)
-- ============================================
create table rewards (
  id uuid primary key default gen_random_uuid(),
  business text not null,
  title text not null,
  description text,
  icon text default 'ti-gift',
  image_url text,
  cost int not null default 100,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- REDEMPTIONS (audit log)
-- ============================================
create table redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reward_id uuid not null references rewards(id) on delete cascade,
  cost_at_redemption int not null,
  redeemed_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_requests_status on requests(status);
create index idx_requests_user on requests(user_id);
create index idx_profiles_points on profiles(points desc);
create index idx_rewards_active on rewards(active, cost);
create index idx_redemptions_user on redemptions(user_id, redeemed_at desc);

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
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- STREAK UPDATE ON SUBMISSION
-- ============================================
create or replace function update_streak_on_submit()
returns trigger as $$
declare
  v_last date;
  v_today date := current_date;
begin
  select last_submission_date into v_last from profiles where id = new.user_id;
  if v_last = v_today then
    -- already submitted today, no change
    return new;
  elsif v_last = v_today - 1 then
    update profiles set streak = streak + 1, last_submission_date = v_today where id = new.user_id;
  else
    update profiles set streak = 1, last_submission_date = v_today where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_request_streak on requests;
create trigger on_request_streak
  after insert on requests
  for each row execute function update_streak_on_submit();

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

  update profiles set
    points = points + v_pts,
    total_earned = total_earned + v_pts
  where id = v_user;
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
-- REDEEM REWARD (atomic: checks balance, deducts, logs)
-- ============================================
create or replace function redeem_reward(p_reward_id uuid)
returns void as $$
declare
  v_user uuid := auth.uid();
  v_cost int;
  v_balance int;
begin
  if v_user is null then raise exception 'Not signed in'; end if;

  select cost into v_cost from rewards where id = p_reward_id and active = true;
  if v_cost is null then raise exception 'Reward not found or inactive'; end if;

  select points into v_balance from profiles where id = v_user;
  if v_balance < v_cost then raise exception 'Not enough points'; end if;

  update profiles set points = points - v_cost where id = v_user;
  insert into redemptions (user_id, reward_id, cost_at_redemption)
    values (v_user, p_reward_id, v_cost);
end;
$$ language plpgsql security definer;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table quests enable row level security;
alter table requests enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;

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

-- Rewards: read all, only admin writes
create policy "rewards_read_all" on rewards for select using (true);
create policy "rewards_admin_write" on rewards for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Redemptions: user reads own, admin reads all, inserts via RPC only
create policy "redemptions_read_own_or_admin" on redemptions for select using (
  auth.uid() = user_id
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
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
insert into quests (title, description, icon, image_url, points, proof_type) values
  ('Hike Marjan to the top', 'Climb to Telegrin viewpoint, photo of the city below', 'ti-mountain',
   'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&q=70', 70, 'photo'),
  ('Morning coffee at Riva', 'Skip the chains — sit at a Riva kavana with a real macchiato', 'ti-coffee',
   'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=70', 40, 'photo'),
  ('Fresh produce at Pazar', 'Buy seasonal fruit or veg at the open-air market, photo your bag', 'ti-shopping-bag',
   'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=70', 45, 'photo'),
  ('Fish at Ribarnica', 'Pick up fresh fish at the city fish market, photo the catch', 'ti-fish',
   'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=400&q=70', 50, 'photo'),
  ('Konoba lunch in the old town', 'Eat pašticada, peka or black risotto in a real konoba', 'ti-tools-kitchen-2',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70', 60, 'photo'),
  ('Swim at Bačvice', 'Quick swim or picigin game on the sand, photo the bay', 'ti-wave-saw-tool',
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70', 50, 'photo'),
  ('Walk Diocletian''s Palace', 'Wander the Peristil and cellars inside the old palace', 'ti-building-castle',
   'https://images.unsplash.com/photo-1565006447831-77bf523dbd2c?w=400&q=70', 55, 'photo'),
  ('Report a pothole or broken bench', 'Help the city — photo + pin for komunalno', 'ti-alert-triangle',
   'https://images.unsplash.com/photo-1597176116047-876a32798fcc?w=400&q=70', 50, 'photo'),
  ('Ride the Promet bus', 'Leave the car at home, take public transit today', 'ti-bus',
   'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&q=70', 40, 'photo'),
  ('Help an elderly neighbor', 'Groceries, errands, or just a chat on the balkon', 'ti-heart-handshake',
   'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=70', 80, 'photo'),
  ('Žnjan beach cleanup', 'Organized cleanup event — organizer scans your QR on arrival', 'ti-trash',
   'https://images.unsplash.com/photo-1583244532610-2a234e9d6db4?w=400&q=70', 120, 'qr'),
  ('Cheer Hajduk at Poljud', 'Match day at the stadium, photo from the stands', 'ti-ball-football',
   'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&q=70', 90, 'photo');

insert into rewards (business, title, description, icon, image_url, cost) values
  ('Konoba Fetivi', 'Free coffee + burek', 'Drop in and show this code at the counter', 'ti-coffee',
   'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=70', 300),
  ('Pazar market', '10% off any vendor', 'Valid for one purchase, any vendor in the market', 'ti-shopping-bag',
   'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=70', 200),
  ('Museum of Croatian Monuments', 'Free entry for 2', 'Two tickets, valid for one month', 'ti-building-monument',
   'https://images.unsplash.com/photo-1565006447831-77bf523dbd2c?w=400&q=70', 600),
  ('Restoran Varoš', 'Free lunch for 2', 'Daily menu, valid Tue–Fri', 'ti-tools-kitchen-2',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70', 1000);
