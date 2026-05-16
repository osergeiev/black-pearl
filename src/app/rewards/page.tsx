import { requireUser } from '@/lib/auth';
import { UserNav } from '@/components/UserNav';
import { RewardsView } from './RewardsView';

export const dynamic = 'force-dynamic';

const REWARDS = [
  {
    biz: 'Konoba Fetivi',
    title: 'Free coffee + burek',
    icon: 'ti-coffee',
    image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=70',
    cost: 300
  },
  {
    biz: 'Pazar market',
    title: '10% off any vendor',
    icon: 'ti-shopping-bag',
    image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=70',
    cost: 200
  },
  {
    biz: 'Museum of Croatian Monuments',
    title: 'Free entry for 2',
    icon: 'ti-building-monument',
    image_url: 'https://images.unsplash.com/photo-1565006447831-77bf523dbd2c?w=400&q=70',
    cost: 600
  },
  {
    biz: 'Restoran Varoš',
    title: 'Free lunch for 2',
    icon: 'ti-tools-kitchen-2',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70',
    cost: 1000
  }
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
