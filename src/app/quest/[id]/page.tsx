import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { ProofForm } from './ProofForm';
import type { Quest } from '@/types';

export const dynamic = 'force-dynamic';

export default async function QuestPage({ params }: { params: { id: string } }) {
  await requireUser();
  const supabase = createClient();
  const { data: quest } = await supabase.from('quests').select('*').eq('id', params.id).single<Quest>();
  if (!quest) notFound();
  return <ProofForm quest={quest} />;
}
