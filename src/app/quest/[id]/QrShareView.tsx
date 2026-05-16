'use client';

import { useRouter } from 'next/navigation';
import { IconQrcode, IconInfoCircle, IconX, IconMapPin } from '@tabler/icons-react';
import { QrDisplay } from '@/components/QrDisplay';
import type { Profile, Quest } from '@/types';

export function QrShareView({ profile, quest }: { profile: Profile; quest: Quest }) {
  const router = useRouter();
  const payload = `SPLITSKI_USER:${profile.id}:${profile.name}`;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-green px-[18px] py-5 text-white flex-shrink-0 relative">
        <button
          onClick={() => router.push('/home')}
          className="absolute top-[18px] right-4 bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"
        >
          <IconX size={12} />Close
        </button>
        <div className="text-[21px] font-black mb-0.5 flex items-center gap-2">
          <IconQrcode size={22} />{quest.title}
        </div>
        <div className="text-xs opacity-80 font-semibold">Show this QR to the event organizer</div>
      </div>

      <div className="p-3.5 flex flex-col gap-3 items-center">
        {quest.image_url && (
          <div className="w-full h-32 rounded-[11px] overflow-hidden">
            <img src={quest.image_url} alt={quest.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="text-center w-full">
          {quest.address && (
            <div className="text-[11px] text-brand-muted font-bold mb-2 flex items-center justify-center gap-1">
              <IconMapPin size={12} />{quest.address}
            </div>
          )}
          <div className="bg-white border-[1.5px] border-brand-beige-dark rounded-[13px] p-4 inline-block">
            <QrDisplay value={payload} size={200} />
          </div>
          <div className="text-[13px] font-black text-[#1a1a1a] mt-2">{profile.name}</div>
          <div className="text-[11px] text-brand-muted font-bold font-mono mt-0.5">
            ID: {profile.id.slice(0, 8)}
          </div>
        </div>

        <div className="bg-brand-green-bg rounded-[12px] p-3.5 border-[1.5px] border-[#c8e6c9] w-full">
          <div className="text-xs font-extrabold text-brand-green mb-1 flex items-center gap-1.5">
            <IconInfoCircle size={13} />How it works
          </div>
          <div className="text-[11px] text-[#3a3a3a] font-semibold leading-relaxed">
            The organizer scans this code at the event. You&apos;ll get{' '}
            <span className="font-black text-brand-green">+{quest.points} pts</span> automatically — no admin
            approval needed.
          </div>
        </div>
      </div>
    </div>
  );
}
