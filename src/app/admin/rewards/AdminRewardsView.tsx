'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconGift, IconPlus, IconTrash, IconStarFilled, IconLogout, IconEye, IconEyeOff
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';
import type { Reward } from '@/types';

export function AdminRewardsView({ rewards: initial }: { rewards: Reward[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [rewards, setRewards] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm('Delete this reward? Redemption history will keep a reference but the catalog entry is gone.')) return;
    setBusy(id);
    const { error } = await supabase.from('rewards').delete().eq('id', id);
    setBusy(null);
    if (error) { alert(error.message); return; }
    setRewards(rewards.filter((r) => r.id !== id));
    router.refresh();
  }

  async function toggleActive(r: Reward) {
    setBusy(r.id);
    const { error } = await supabase.from('rewards').update({ active: !r.active }).eq('id', r.id);
    setBusy(null);
    if (error) { alert(error.message); return; }
    setRewards(rewards.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)));
    router.refresh();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-purple px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={logout} className="absolute top-[18px] right-4 bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconLogout size={12} />Logout
        </button>
        <div className="text-[21px] font-black flex items-center gap-2 mb-0.5"><IconGift size={22} />Rewards</div>
        <div className="text-xs opacity-80 font-semibold">Manage the rewards catalog</div>
      </div>

      <Link href="/admin/rewards/create" className="mx-3.5 my-3.5 bg-brand-purple text-white text-[13px] font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5">
        <IconPlus size={16} />New reward
      </Link>

      <div className="px-3.5 pb-1.5 flex items-center justify-between">
        <div className="text-sm font-extrabold text-brand-purple">All rewards</div>
        <div className="text-[11px] text-brand-muted font-bold">{rewards.length} total</div>
      </div>

      <div className="px-3.5 pb-3 flex flex-col gap-2">
        {rewards.length === 0 && (
          <div className="text-center py-8 text-brand-muted font-bold text-sm">No rewards yet.</div>
        )}
        {rewards.map((r) => (
          <div key={r.id} className={`bg-white rounded-[13px] p-3 flex items-center gap-2.5 border-[1.5px] border-brand-beige ${!r.active ? 'opacity-55' : ''}`}>
            <div className="w-[58px] h-[58px] rounded-[11px] bg-brand-beige flex items-center justify-center flex-shrink-0 overflow-hidden">
              {r.image_url ? (
                <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
              ) : (
                <i className={`ti ${r.icon}`} style={{ fontSize: 24 }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wide">{r.business}</div>
              <div className="text-xs font-extrabold text-[#1a1a1a] mb-px leading-tight">{r.title}</div>
              <div className="text-xs font-black text-brand-amber flex items-center gap-0.5 mt-1">
                <IconStarFilled size={11} className="text-brand-amber" />{r.cost} pts
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <button
                onClick={() => toggleActive(r)}
                disabled={busy === r.id}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  r.active ? 'bg-brand-green text-white' : 'bg-brand-beige-dark text-brand-muted'
                }`}
                title={r.active ? 'Active — click to hide' : 'Hidden — click to activate'}
              >
                {r.active ? <IconEye size={11} /> : <IconEyeOff size={11} />}
                {r.active ? 'Active' : 'Hidden'}
              </button>
              <button onClick={() => del(r.id)} disabled={busy === r.id} className="bg-brand-coral text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                <IconTrash size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
