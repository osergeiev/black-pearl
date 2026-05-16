'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconPaw, IconHistory, IconGift, IconTrophy } from '@tabler/icons-react';

const items = [
  { href: '/home', label: 'Home', icon: IconHome },
  { href: '/sheep', label: 'Sheep', icon: IconPaw },
  { href: '/myrequests', label: 'My', icon: IconHistory },
  { href: '/rewards', label: 'Rewards', icon: IconGift },
  { href: '/leaderboard', label: 'Rank', icon: IconTrophy }
];

export function UserNav() {
  const pathname = usePathname();
  return (
    <div className="flex-shrink-0 bg-white border-t border-brand-beige-dark flex h-[58px]">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
              active ? 'text-brand-green' : 'text-[#b0a898]'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
