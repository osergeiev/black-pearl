import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { ProofForm } from './ProofForm';
import type { Quest } from '@/types';

export const dynamic = 'force-dynamic';

export default async function QuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const supabase = await createClient();
  const { data: quest } = await supabase.from('quests').select('*').eq('id', id).single<Quest>();
  if (!quest) notFound();
  return <ProofForm quest={quest} />;
}
