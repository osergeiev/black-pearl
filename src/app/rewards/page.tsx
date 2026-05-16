import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { UserNav } from '@/components/UserNav';
import { RewardsView } from './RewardsView';
import type { Reward } from '@/types';

export const dynamic = 'force-dynamic';

export default async function RewardsPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('active', true)
    .order('cost');
  return (
    <>
      <RewardsView profile={profile} rewards={(rewards as Reward[]) ?? []} />
      <UserNav />
    </>
  );
}
