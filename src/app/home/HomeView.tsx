'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconStarFilled,
  IconFlame,
  IconFlower,
  IconListCheck,
  IconCamera,
  IconQrcode,
  IconClock,
  IconLogout,
  IconCheck
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';
import { SheepSvg } from '@/components/SheepSvg';
import type { Profile, Quest, Request } from '@/types';

export function HomeView({
  profile,
  quests,
  myRequests
}: {
  profile: Profile;
  quests: Quest[];
  myRequests: Request[];
}) {
  const router = useRouter();
  const sheepRef = useRef<HTMLDivElement>(null);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function bounce() {
    sheepRef.current?.classList.remove('bouncing');
    void sheepRef.current?.offsetWidth;
    sheepRef.current?.classList.add('bouncing');
  }

  const pendingIds = new Set(myRequests.filter((r) => r.status === 'pending').map((r) => r.quest_id));
  const doneIds = new Set(myRequests.filter((r) => r.status === 'approved').map((r) => r.quest_id));
  const earned = profile.total_earned ?? profile.points;
  const progress = Math.min(100, Math.round(earned / 6));
  const level =
    earned < 100 ? 'Splitski Newbie'
    : earned < 300 ? 'Splitski Regular'
    : earned < 600 ? 'Splitski Hero'
    : earned < 1000 ? 'Splitski Star'
    : 'Legend of Split';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-green px-[18px] py-5 text-white flex-shrink-0 relative">
        <button
          onClick={logout}
          className="absolute top-[18px] right-4 bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"
        >
          <IconLogout size={12} />Logout
        </button>
        <div className="text-[11px] opacity-75 font-bold mb-0.5">Good morning, Split!</div>
        <div className="text-xl font-black mb-3">{profile.name}</div>
        <div className="flex items-center gap-[7px] flex-wrap">
          <div className="bg-white/20 rounded-full px-3 py-1 text-[13px] font-black flex items-center gap-1">
            <IconStarFilled size={13} className="text-[#ffd970]" />
            {profile.points} pts
          </div>
          <div className="bg-white/15 rounded-full px-2.5 py-1 text-[11px] font-bold">{level}</div>
          <div className="ml-auto bg-white/15 rounded-full px-2 py-1 text-[11px] font-bold flex items-center gap-1">
            <IconFlame size={12} className="text-[#ffb347]" />{profile.streak} {profile.streak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center px-[18px] pt-3.5 pb-2">
        <div ref={sheepRef} onClick={bounce} className="cursor-pointer">
          <SheepSvg size={130} />
        </div>
        <div className="text-[11px] font-extrabold text-brand-green mt-1 flex items-center gap-1">
          <IconFlower size={13} className="text-[#d4537e]" />
          Happy &amp; thriving
        </div>
        <div className="text-[13px] font-black text-[#1a1a1a] mt-0.5">Splitka</div>
        <div className="w-full px-1 mt-2">
          <div className="w-full bg-brand-beige-dark rounded-full h-1.5 overflow-hidden">
            <div className="h-1.5 rounded-full bg-brand-green transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-[10px] text-brand-muted font-bold mt-0.5">
            {earned} / 600 lifetime points → next level
          </div>
        </div>
      </div>

      <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between flex-shrink-0">
        <div className="text-sm font-extrabold text-[#1a1a1a] flex items-center gap-1.5">
          <IconListCheck size={15} className="text-brand-green" />Today&apos;s quests
        </div>
        <div className="text-[11px] text-brand-muted font-bold">{quests.length} available</div>
      </div>

      <div className="px-[13px] flex flex-col gap-2 pb-3">
        {quests.map((q) => {
          const isPending = pendingIds.has(q.id);
          const isDone = doneIds.has(q.id);
          let btn;
          if (isDone) btn = <button className="bg-brand-beige-dark text-brand-muted text-[10px] font-extrabold px-2.5 py-1 rounded-full">✓ Done</button>;
          else if (isPending) btn = <button className="bg-[#ffc875] text-[#7a4d0c] text-[10px] font-extrabold px-2.5 py-1 rounded-full">Pending</button>;
          else if (q.proof_type === 'qr') btn = <button onClick={() => router.push(`/quest/${q.id}`)} className="bg-brand-green text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">Show QR</button>;
          else btn = <button onClick={() => router.push(`/quest/${q.id}`)} className="bg-brand-green text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">Prove</button>;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-[13px] p-3 flex items-center gap-2.5 border-[1.5px] transition-opacity ${
                isDone ? 'opacity-45 border-brand-beige' : isPending ? 'border-[#ffc875] bg-[#fffaf0]' : 'border-brand-beige'
              }`}
            >
              <div className="w-[58px] h-[58px] rounded-[11px] bg-brand-beige flex items-center justify-center flex-shrink-0 text-brand-green overflow-hidden">
                {q.image_url ? (
                  <img src={q.image_url} alt={q.title} className="w-full h-full object-cover" />
                ) : (
                  <i className={`ti ${q.icon}`} style={{ fontSize: 24 }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-[#1a1a1a] mb-px leading-tight">{q.title}</div>
                <div className="text-[10px] text-brand-muted font-semibold leading-tight">{q.description}</div>
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-1 ${
                    isPending ? 'bg-[#fff3e0] text-[#a85e0c]'
                    : q.proof_type === 'qr' ? 'bg-brand-teal-bg text-brand-teal'
                    : 'bg-[#EAF2FF] text-brand-blue'
                  }`}
                >
                  {isPending ? <><IconClock size={11} />Pending</> :
                   q.proof_type === 'qr' ? <><IconQrcode size={11} />QR scan</> :
                   <><IconCamera size={11} />Photo + admin</>}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="text-xs font-black text-brand-amber flex items-center gap-0.5">
                  <IconStarFilled size={11} className="text-brand-amber" />+{q.points}
                </div>
                {btn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
