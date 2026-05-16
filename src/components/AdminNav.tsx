'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconClockHour4, IconListCheck, IconGift } from '@tabler/icons-react';

const items = [
  { href: '/admin', label: 'Requests', icon: IconClockHour4 },
  { href: '/admin/quests', label: 'Quests', icon: IconListCheck },
  { href: '/admin/rewards', label: 'Rewards', icon: IconGift }
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex-shrink-0 bg-white border-t border-brand-beige-dark flex h-[58px]">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wide transition-colors ${
              active ? 'text-brand-purple' : 'text-[#b0a898]'
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
