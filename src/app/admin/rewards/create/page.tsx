import { requireAdmin } from '@/lib/auth';
import { AdminNav } from '@/components/AdminNav';
import { CreateRewardView } from './CreateRewardView';

export const dynamic = 'force-dynamic';

export default async function CreateRewardPage() {
  await requireAdmin();
  return (
    <>
      <CreateRewardView />
      <AdminNav />
    </>
  );
}
