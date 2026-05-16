# 🐑 Splitski

A gamified civic engagement web app for the city of Split. Users complete quests (visit local konobas, clean beaches, report potholes) and earn points redeemable for rewards at local businesses. Admins approve photo proof and manage quests.

Built with **Next.js 14 + TypeScript + Tailwind + Supabase**.

---

## 📁 Project structure

```
splitski-app/
├── src/
│   ├── app/
│   │   ├── login/page.tsx              ← login + signup (role-based)
│   │   ├── home/                       ← user home (quests + sheep)
│   │   ├── sheep/page.tsx              ← sheep companion + levels
│   │   ├── myrequests/page.tsx         ← user's submission history
│   │   ├── qr/                         ← user's personal QR code
│   │   ├── rewards/                    ← redeemable rewards
│   │   ├── leaderboard/page.tsx        ← neighborhood ranking
│   │   ├── quest/[id]/                 ← photo proof submission
│   │   ├── admin/page.tsx              ← pending request approval
│   │   ├── admin/quests/               ← admin quest list / delete
│   │   ├── admin/create/               ← create new quest + QR generator
│   │   ├── layout.tsx                  ← root layout (fonts + phone frame)
│   │   ├── page.tsx                    ← root redirector
│   │   └── globals.css
│   ├── components/
│   │   ├── SheepSvg.tsx                ← reusable sheep illustration
│   │   ├── Header.tsx                  ← screen headers
│   │   ├── UserNav.tsx                 ← bottom nav (user)
│   │   ├── AdminNav.tsx                ← bottom nav (admin)
│   │   ├── Screen.tsx                  ← screen wrapper
│   │   └── Toast.tsx                   ← toast notifications
│   ├── lib/
│   │   ├── supabase-client.ts          ← browser Supabase client
│   │   ├── supabase-server.ts          ← server Supabase client
│   │   └── auth.ts                     ← auth helpers (requireUser/Admin)
│   ├── types/index.ts                  ← TypeScript types
│   └── middleware.ts                   ← session refresh
├── supabase/
│   └── schema.sql                      ← run once in Supabase SQL editor
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── .env.example
└── README.md
```

---

## 🚀 Setup (5 minutes)

### 1. Install dependencies

```bash
cd splitski-app
npm install
```

### 2. Create a Supabase project

1. Go to <https://supabase.com> → **New project**
2. Pick any name + password, region close to you (Frankfurt for Split)
3. Wait ~1 min for it to provision

### 3. Run the database schema

In the Supabase dashboard:

1. Click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/schema.sql` from this repo, copy/paste **everything**, click **Run**

This creates: `profiles`, `quests`, `requests` tables; the `approve_request` and `reject_request` functions; Row Level Security; the `proof-photos` storage bucket; and seeds 6 starter quests.

### 4. Get your API keys

In Supabase dashboard → **Project Settings → API**:
- Copy the **Project URL**
- Copy the **anon public** key

### 5. Add environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 6. Run the app

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## 👤 Creating accounts

### First user (admin)

1. Open the app, click **Sign in → "Don't have an account? Sign up"**
2. Switch the toggle to **🛡️ Admin** before filling form
3. Sign up with email + password

**Important — disable email confirmation for the demo:**
Supabase dashboard → **Authentication → Providers → Email** → toggle off "**Confirm email**" → Save. Otherwise you'll need to verify the email before logging in.

### Test user

Repeat sign-up but with the **👤 User** toggle. Sign in/out to switch between accounts.

---

## ✨ How it works

### User flow
1. **Sign in** → see today's quests on the home screen
2. **Tap "Prove" on a photo quest** → upload a photo → submit
3. Request goes to admin queue with status **"Pending"**
4. **Admin approves** → points are atomically added to user's profile
5. **Earn enough points** → redeem rewards at local businesses
6. **QR-proof quests** → user shows QR at event, organizer scans it

### Admin flow
1. **Sign in as admin** → see pending requests with photos
2. **Approve** → user's points go up (handled by the `approve_request` SQL function — atomic, safe)
3. **Reject** → marks request rejected, no points
4. **Create new quests** → choose photo or QR proof type
5. For QR quests → pick generation method (auto/event/organizer) → generate QR code

---

## 🗄️ Database schema (quick reference)

- **profiles** — extends `auth.users`. Holds name, points, role (user/admin), neighborhood.
- **quests** — title, description, icon, points, proof_type ('photo' | 'qr').
- **requests** — user_id, quest_id, status ('pending' | 'approved' | 'rejected'), photo_url.

Auto-created on signup via trigger. Row Level Security is on — users can only see/edit their own data; admins see everything.

### RPC functions
- `approve_request(req_id)` — atomically marks approved and adds points to user
- `reject_request(req_id)` — marks rejected, no points

### Storage
- Bucket `proof-photos` — public read, authenticated upload

---

## 🎬 Demo script for judges (5 minutes)

1. **Login screen** — show role toggle, sign up flow
2. **As USER:** browse quests → tap a photo quest → upload photo → submit
3. **Logout → sign in as ADMIN** — see the request in the queue
4. **Tap Approve** — point out points instantly go to user
5. **Tap "Quests" tab → "New quest"** — create one, switch proof to QR, choose method, generate QR live
6. **Logout → sign in as USER again** — see new quest appear, see approved status, see updated points
7. **Tap "Rewards"** — redeem one
8. **Tap "Leaderboard"** — show ranking

---

## 🐛 Troubleshooting

- **"Email not confirmed" on sign in** → disable email confirmation in Supabase Auth settings (see above)
- **Photos not uploading** → check the `proof-photos` bucket exists and is public (schema does this; re-run if missing)
- **Admin sees no requests** → make sure you signed up with the Admin toggle (sets `role='admin'` in profile). Alternatively run in SQL Editor: `update profiles set role='admin' where name='your name';`
- **TypeScript errors after install** → run `npm run build` once to generate `.next/types`

---

## 📝 What you can extend later

- Real-time leaderboard with Supabase Realtime (`supabase.channel('...').on(...)`)
- Edge Function to auto-verify photos with AI (Claude / OpenAI vision)
- QR scanner page for organizers (use `html5-qrcode` library)
- Push notifications when admin approves
- Map view with reported potholes

Good luck at the hackathon! 🐑🏆
