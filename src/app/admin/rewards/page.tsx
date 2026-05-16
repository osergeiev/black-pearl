import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/AdminNav';
import { AdminRewardsView } from './AdminRewardsView';
import type { Reward } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminRewardsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: rewards } = await supabase.from('rewards').select('*').order('created_at', { ascending: false });
  return (
    <>
      <AdminRewardsView rewards={(rewards as Reward[]) ?? []} />
      <AdminNav />
    </>
  );
}
