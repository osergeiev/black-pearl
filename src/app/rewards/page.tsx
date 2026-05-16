import { requireUser } from '@/lib/auth';
import { UserNav } from '@/components/UserNav';
import { RewardsView } from './RewardsView';

export const dynamic = 'force-dynamic';

const REWARDS = [
  { biz: 'Konoba Fetivi', title: 'Free coffee + burek', icon: 'ti-coffee', cost: 300 },
  { biz: 'Pazar market', title: '10% off any vendor', icon: 'ti-shopping-bag', cost: 200 },
  { biz: 'Museum of Croatian Monuments', title: 'Free entry for 2', icon: 'ti-building-monument', cost: 600 },
  { biz: 'Restoran Varoš', title: 'Free lunch for 2', icon: 'ti-tools-kitchen-2', cost: 1000 }
];

export default async function RewardsPage() {
  const { profile } = await requireUser();
  return (
    <>
      <RewardsView profile={profile} rewards={REWARDS} />
      <UserNav />
    </>
  );
}
