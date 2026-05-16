import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/AdminNav';
import { ScanView } from './ScanView';
import type { Quest } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminScanPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('active', true)
    .eq('proof_type', 'qr')
    .order('created_at');
  return (
    <>
      <ScanView quests={(quests as Quest[]) ?? []} />
      <AdminNav />
    </>
  );
}
