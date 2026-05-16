'use client';

import { IconLogout, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

type Color = 'green' | 'blue' | 'red' | 'purple';

const bg: Record<Color, string> = {
  green: 'bg-brand-green',
  blue: 'bg-brand-blue',
  red: 'bg-brand-red',
  purple: 'bg-brand-purple'
};

export function Header({
  title,
  subtitle,
  color = 'green',
  icon,
  showLogout = true,
  closeHref
}: {
  title: string;
  subtitle?: string;
  color?: Color;
  icon?: React.ReactNode;
  showLogout?: boolean;
  closeHref?: string;
}) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className={`${bg[color]} px-[18px] py-[18px] pt-5 text-white flex-shrink-0 relative`}>
      {closeHref ? (
        <button
          onClick={() => router.push(closeHref)}
          className="absolute top-[18px] right-4 bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"
        >
          <IconX size={12} />Close
        </button>
      ) : showLogout ? (
        <button
          onClick={logout}
          className="absolute top-[18px] right-4 bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"
        >
          <IconLogout size={12} />Logout
        </button>
      ) : null}
      <div className="text-[21px] font-black flex items-center gap-2 mb-0.5">
        {icon}
        {title}
      </div>
      {subtitle && <div className="text-xs opacity-80 font-semibold">{subtitle}</div>}
    </div>
  );
}
