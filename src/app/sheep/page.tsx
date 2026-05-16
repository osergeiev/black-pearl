import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { UserNav } from '@/components/UserNav';
import { Header } from '@/components/Header';
import { SheepSvg } from '@/components/SheepSvg';
import {
  IconFlame, IconStairsUp, IconMoodSad, IconMoodNeutral,
  IconMoodHappy, IconSparkles, IconCrown, IconCheck, IconMapPin, IconLock
} from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

export default async function SheepPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const [{ count: questsDone }, { count: rewardsEarned }] = await Promise.all([
    supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('status', 'approved'),
    supabase
      .from('redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
  ]);

  const pts = profile.total_earned ?? profile.points;
  const current = pts < 100 ? 0 : pts < 300 ? 1 : pts < 600 ? 2 : pts < 1000 ? 3 : 4;
  const levels = [
    { name: 'Starving', range: '0–99 points', Icon: IconMoodSad },
    { name: 'Okay', range: '100–299 points', Icon: IconMoodNeutral },
    { name: 'Happy', range: '300–599 points', Icon: IconMoodHappy },
    { name: 'Thriving', range: '600–999 points', Icon: IconSparkles },
    { name: 'Legend of Split', range: '1000+ points', Icon: IconCrown }
  ];
  const moods = [
    'Hungry — feed me with quests!',
    'Doing okay — keep going!',
    'Happy & full of energy',
    'Thriving — Split is proud',
    'Legend status — the city loves you'
  ];

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <Header title="" subtitle="" color="green" showLogout />
        <div className="bg-brand-green px-[18px] pt-1 pb-6 flex flex-col items-center text-white flex-shrink-0 -mt-3">
          <SheepSvg size={160} />
          <div className="text-[22px] font-black mt-2">Splitka</div>
          <div className="text-xs opacity-85 font-bold mt-0.5">{moods[current]}</div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 px-3.5 py-3.5">
          <Stat num={profile.total_earned ?? profile.points} label="Total earned" />
          <Stat num={profile.streak ?? 0} label="Day streak" icon={<IconFlame size={11} className="text-[#ffb347]" />} />
          <Stat num={questsDone ?? 0} label="Quests done" />
          <Stat num={rewardsEarned ?? 0} label="Rewards earned" />
        </div>

        <div className="px-3.5 pb-1.5 flex items-center justify-between">
          <div className="text-sm font-extrabold text-[#1a1a1a] flex items-center gap-1.5">
            <IconStairsUp size={15} className="text-brand-green" />Sheep levels
          </div>
        </div>

        <div className="px-3.5 pb-4">
          {levels.map((l, idx) => {
            const isDone = idx < current;
            const isCurrent = idx === current;
            return (
              <div
                key={l.name}
                className={`flex items-center gap-2.5 py-2.5 ${
                  isCurrent ? 'bg-brand-green-bg rounded-[10px] px-2.5' : 'border-b border-brand-beige'
                }`}
              >
                <div className="w-9 flex justify-center">
                  <l.Icon size={24} className={isDone || isCurrent ? 'text-brand-green' : 'text-[#b0a898]'} />
                </div>
                <div className="flex-1">
                  <div className={`text-[11px] font-extrabold ${isCurrent ? 'text-brand-green' : 'text-[#1a1a1a]'}`}>
                    {l.name}{isCurrent && ' ← you are here'}
                  </div>
                  <div className="text-[10px] text-brand-muted font-bold">{l.range}</div>
                </div>
                {isDone ? <IconCheck size={14} className="text-brand-green" /> :
                 isCurrent ? <IconMapPin size={14} className="text-brand-green" /> :
                 <IconLock size={14} className="text-[#b0a898]" />}
              </div>
            );
          })}
        </div>
      </div>
      <UserNav />
    </>
  );
}

function Stat({ num, label, icon }: { num: number; label: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[12px] p-3 text-center border-[1.5px] border-brand-beige">
      <div className="text-2xl font-black text-brand-green">{num}</div>
      <div className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wide mt-0.5 flex items-center justify-center gap-1">
        {icon}{label}
      </div>
    </div>
  );
}
