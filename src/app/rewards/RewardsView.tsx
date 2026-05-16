'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconGift, IconStarFilled, IconLock, IconLogout } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';
import type { Profile } from '@/types';

type Reward = { biz: string; title: string; icon: string; cost: number };

export function RewardsView({ profile, rewards }: { profile: Profile; rewards: Reward[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [pts, setPts] = useState(profile.points);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  async function redeem(r: Reward) {
    if (pts < r.cost) return;
    setRedeeming(r.title);
    const newPts = pts - r.cost;
    const { error } = await supabase.from('profiles').update({ points: newPts }).eq('id', profile.id);
    setRedeeming(null);
    if (error) { alert(error.message); return; }
    setPts(newPts);
    alert(`Reward redeemed! Show this at ${r.biz}.`);
    router.refresh();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-coral px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={logout} className="absolute top-[18px] right-4 bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconLogout size={12} />Logout
        </button>
        <div className="text-[21px] font-black flex items-center gap-2 mb-0.5"><IconGift size={22} />Rewards</div>
        <div className="text-xs opacity-80 font-semibold">Spend points at local businesses</div>
        <div className="bg-white/20 rounded-[11px] px-3 py-2 mt-3 inline-flex items-center gap-1.5 text-sm font-black">
          <IconStarFilled size={14} className="text-[#ffd970]" />{pts} points available
        </div>
      </div>
      <div className="p-3.5 flex flex-col gap-2.5">
        {rewards.map((r) => {
          const locked = pts < r.cost;
          return (
            <div key={r.title} className={`bg-white rounded-[13px] p-3.5 border-[1.5px] border-brand-beige ${locked ? 'opacity-55' : ''}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-11 h-11 rounded-[11px] bg-brand-coral-bg flex items-center justify-center flex-shrink-0">
                  <i className={`ti ${r.icon}`} style={{ fontSize: 24, color: '#FF6B6B' }} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wide">{r.biz}</div>
                  <div className="text-[13px] font-extrabold text-[#1a1a1a]">{r.title}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-brand-amber flex items-center gap-0.5">
                  <IconStarFilled size={12} className="text-brand-amber" />{r.cost} pts
                </div>
                {locked ? (
                  <button disabled className="bg-brand-beige-dark text-brand-muted text-[11px] font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-1">
                    <IconLock size={11} />{r.cost - pts} more
                  </button>
                ) : (
                  <button onClick={() => redeem(r)} disabled={redeeming === r.title} className="bg-brand-coral text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full">
                    {redeeming === r.title ? 'Redeeming...' : 'Redeem'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
