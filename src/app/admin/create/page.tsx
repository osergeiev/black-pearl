import { requireAdmin } from '@/lib/auth';
import { CreateQuestView } from './CreateQuestView';

export const dynamic = 'force-dynamic';

export default async function AdminCreatePage() {
  await requireAdmin();
  return <CreateQuestView />;
}
