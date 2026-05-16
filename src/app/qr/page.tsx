import { requireUser } from '@/lib/auth';
import { UserNav } from '@/components/UserNav';
import { Header } from '@/components/Header';
import { IconQrcode, IconInfoCircle } from '@tabler/icons-react';
import { QrDisplay } from './QrDisplay';

export const dynamic = 'force-dynamic';

export default async function QrPage() {
  const { profile } = await requireUser();
  const data = `SPLITSKI_USER:${profile.id}:${profile.name}`;
  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <Header title="Your QR code" subtitle="Show this to event organizers" icon={<IconQrcode size={22} />} color="green" />
        <div className="p-3.5 flex flex-col gap-3 items-center">
          <div className="text-center w-full">
            <div className="text-[11px] text-brand-muted font-bold mb-2">Bačvice beach cleanup — today</div>
            <div className="bg-white border-[1.5px] border-brand-beige-dark rounded-[13px] p-3.5 inline-block">
              <QrDisplay value={data} size={150} />
            </div>
            <div className="text-[13px] font-black text-[#1a1a1a] mt-2">{profile.name}</div>
            <div className="text-[11px] text-brand-muted font-bold font-mono mt-0.5">ID: {profile.id.slice(0, 8)}</div>
          </div>
          <div className="bg-brand-green-bg rounded-[12px] p-3.5 border-[1.5px] border-[#c8e6c9] w-full">
            <div className="text-xs font-extrabold text-brand-green mb-1 flex items-center gap-1.5">
              <IconInfoCircle size={13} />How it works
            </div>
            <div className="text-[11px] text-[#3a3a3a] font-semibold leading-relaxed">
              The event organizer scans your QR when you arrive. Points are added automatically — no cheating possible.
            </div>
          </div>
        </div>
      </div>
      <UserNav />
    </>
  );
}
