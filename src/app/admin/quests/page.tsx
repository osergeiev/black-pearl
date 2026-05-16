import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/AdminNav';
import { AdminQuestsView } from './AdminQuestsView';
import type { Quest } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminQuestsPage() {
  await requireAdmin();
  const supabase = createClient();
  const { data: quests } = await supabase.from('quests').select('*').order('created_at', { ascending: false });
  return (
    <>
      <AdminQuestsView quests={(quests as Quest[]) ?? []} />
      <AdminNav />
    </>
  );
}
