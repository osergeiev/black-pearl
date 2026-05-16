import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/AdminNav';
import { AdminHomeView } from './AdminHomeView';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from('requests')
    .select('*, quest:quests(*), profile:profiles!user_id(*)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });

  const [{ count: questCount }, { count: userCount }, { count: approvedToday }] = await Promise.all([
    supabase.from('quests').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'approved')
      .gte('reviewed_at', new Date(Date.now() - 86400000).toISOString())
  ]);

  return (
    <>
      <AdminHomeView
        pending={pending || []}
        stats={{
          pending: pending?.length || 0,
          approvedToday: approvedToday || 0,
          quests: questCount || 0,
          users: userCount || 0
        }}
      />
      <AdminNav />
    </>
  );
}
