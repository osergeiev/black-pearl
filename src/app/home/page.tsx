import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { UserNav } from '@/components/UserNav';
import { HomeView } from './HomeView';
import type { Quest, Request } from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: quests } = await supabase.from('quests').select('*').eq('active', true).order('created_at');
  const { data: myRequests } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', profile.id)
    .order('submitted_at', { ascending: false });

  return (
    <>
      <HomeView
        profile={profile}
        quests={(quests as Quest[]) ?? []}
        myRequests={(myRequests as Request[]) ?? []}
      />
      <UserNav />
    </>
  );
}
