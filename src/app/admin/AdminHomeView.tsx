'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconShieldCheck, IconClockHour4, IconStarFilled, IconCheck, IconX,
  IconChecks, IconPhoto, IconLogout
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';

type PendingItem = {
  id: string;
  user_id: string;
  quest_id: string;
  photo_url: string | null;
  submitted_at: string;
  quest: { title: string; points: number; icon: string };
  profile: { name: string };
};

export function AdminHomeView({
  pending,
  stats
}: {
  pending: PendingItem[];
  stats: { pending: number; approvedToday: number; quests: number; users: number };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<PendingItem[]>(pending);
  const [busy, setBusy] = useState<string | null>(null);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  async function approve(id: string) {
    setBusy(id);
    const { error } = await supabase.rpc('approve_request', { req_id: id });
    setBusy(null);
    if (error) { alert(error.message); return; }
    setItems(items.filter((i) => i.id !== id));
    router.refresh();
  }

  async function reject(id: string) {
    setBusy(id);
    const { error } = await supabase.rpc('reject_request', { req_id: id });
    setBusy(null);
    if (error) { alert(error.message); return; }
    setItems(items.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-purple px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={logout} className="absolute top-[18px] right-4 bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconLogout size={12} />Logout
        </button>
        <div className="text-[21px] font-black flex items-center gap-2 mb-0.5"><IconShieldCheck size={22} />Admin panel</div>
        <div className="text-xs opacity-80 font-semibold">City of Split — Splitski platform</div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 p-3.5">
        <StatBox num={stats.pending} label="Pending" />
        <StatBox num={stats.approvedToday} label="Approved today" />
        <StatBox num={stats.quests} label="Active quests" />
        <StatBox num={stats.users} label="Total users" />
      </div>

      <div className="px-3.5 pb-1.5 flex items-center justify-between">
        <div className="text-sm font-extrabold text-brand-purple flex items-center gap-1.5">
          <IconClockHour4 size={15} className="text-[#a85e0c]" />Pending approval
        </div>
        <div className="text-[11px] text-brand-muted font-bold">{items.length} waiting</div>
      </div>

      <div className="px-3.5 pb-3 flex flex-col gap-2.5">
        {items.length === 0 ? (
          <div className="text-center py-10 text-brand-muted font-bold text-sm leading-relaxed">
            <IconChecks size={40} className="text-brand-teal mx-auto mb-2.5" />
            All clear!<br />No pending requests right now.
          </div>
        ) : (
          items.map((pr) => {
            const initials = pr.profile.name.split(' ').map((s) => s[0]).join('').substring(0, 2);
            return (
              <div key={pr.id} className="bg-white rounded-[13px] p-3 border-[1.5px] border-brand-beige">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-full bg-brand-purple text-white flex items-center justify-center font-black text-[13px] flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-[#1a1a1a]">{pr.profile.name}</div>
                    <div className="text-[10px] text-brand-muted font-bold mt-px">
                      {pr.quest.title} • {new Date(pr.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-sm font-black text-brand-amber flex items-center gap-0.5 flex-shrink-0">
                    <IconStarFilled size={12} className="text-brand-amber" />+{pr.quest.points}
                  </div>
                </div>
                <div className="w-full rounded-[10px] h-[140px] bg-brand-beige-dark overflow-hidden mb-2.5 flex items-center justify-center">
                  {pr.photo_url ? <img src={pr.photo_url} alt="proof" className="w-full h-full object-cover" /> : <IconPhoto size={34} className="text-[#b0a898]" />}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => reject(pr.id)} disabled={busy === pr.id} className="flex-1 bg-brand-coral-bg border-[1.5px] border-[#FFC1C1] text-brand-coral text-xs font-extrabold py-2.5 rounded-[10px] flex items-center justify-center gap-1.5">
                    <IconX size={14} />Reject
                  </button>
                  <button onClick={() => approve(pr.id)} disabled={busy === pr.id} className="flex-1 bg-brand-teal text-white text-xs font-extrabold py-2.5 rounded-[10px] flex items-center justify-center gap-1.5">
                    <IconCheck size={14} />Approve
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatBox({ num, label }: { num: number; label: string }) {
  return (
    <div className="bg-white rounded-[12px] p-3 text-center border-[1.5px] border-brand-beige">
      <div className="text-2xl font-black text-brand-purple">{num}</div>
      <div className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}
