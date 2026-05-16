import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { UserNav } from '@/components/UserNav';
import { Header } from '@/components/Header';
import { IconTrophy } from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const { profile } = await requireUser();
  const supabase = createClient();
  const { data: leaders } = await supabase
    .from('profiles')
    .select('id, name, points, neighborhood')
    .order('points', { ascending: false })
    .limit(20);

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <Header title="Leaderboard" subtitle="Manuš neighborhood — this week" icon={<IconTrophy size={22} />} color="blue" />
        <div className="p-3.5 flex flex-col gap-2">
          {(leaders || []).map((l: any, idx: number) => {
            const isMe = l.id === profile.id;
            const initials = l.name.split(' ').map((s: string) => s[0]).join('').substring(0, 2);
            const rankColor = idx === 0 ? 'text-[#d4a017]' : idx === 1 ? 'text-[#9e9e9e]' : idx === 2 ? 'text-[#c17c3a]' : 'text-[#b0a898]';
            return (
              <div
                key={l.id}
                className={`bg-white rounded-[12px] px-3.5 py-3 flex items-center gap-2.5 border-[1.5px] ${
                  isMe ? 'border-brand-green bg-brand-green-bg' : 'border-brand-beige'
                }`}
              >
                <div className={`text-[15px] font-black w-6 text-center ${isMe ? 'text-brand-green' : rankColor}`}>
                  {idx + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-[#e8f4ff] text-[#185FA5] flex items-center justify-center font-black text-xs flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-extrabold ${isMe ? 'text-brand-green' : 'text-[#1a1a1a]'}`}>
                    {l.name}{isMe && ' (you)'}
                  </div>
                  <div className="text-[10px] text-brand-muted font-bold">{l.neighborhood || 'Manuš'}</div>
                </div>
                <div className="text-sm font-black text-brand-green">{l.points}</div>
              </div>
            );
          })}
        </div>
      </div>
      <UserNav />
    </>
  );
}
