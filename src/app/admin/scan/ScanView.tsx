'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconQrcode, IconLogout, IconCheck, IconX, IconAlertTriangle,
  IconCameraRotate, IconPlayerStop
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';
import type { Quest } from '@/types';

type ScanEntry = {
  at: number;
  status: 'ok' | 'dup' | 'err';
  message: string;
  userId?: string;
  name?: string;
};

const SCANNER_ID = 'qr-scanner-region';

export function ScanView({ quests }: { quests: Quest[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [questId, setQuestId] = useState<string>(quests[0]?.id ?? '');
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const inflightRef = useRef<Set<string>>(new Set());
  const scannerRef = useRef<any>(null);

  const selectedQuest = quests.find((q) => q.id === questId);

  useEffect(() => {
    if (!scanning || !questId) return;

    let cancelled = false;
    let html5: any;

    (async () => {
      const mod = await import('html5-qrcode');
      const Html5Qrcode = mod.Html5Qrcode;
      if (cancelled) return;

      html5 = new Html5Qrcode(SCANNER_ID, { verbose: false });
      scannerRef.current = html5;

      try {
        await html5.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded: string) => handleDecoded(decoded),
          () => {}
        );
      } catch (err: any) {
        addEntry({ status: 'err', message: err?.message || 'Camera failed to start', at: Date.now() });
        setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear?.();
          scannerRef.current = null;
        });
      }
    };
  }, [scanning, questId]);

  function addEntry(e: ScanEntry) {
    setHistory((h) => [e, ...h].slice(0, 20));
  }

  async function handleDecoded(text: string) {
    if (!questId) return;
    const match = /^SPLITSKI_USER:([0-9a-f-]{36}):(.*)$/i.exec(text.trim());
    if (!match) {
      addEntry({ at: Date.now(), status: 'err', message: 'Not a Splitski user QR' });
      return;
    }
    const userId = match[1];
    const name = match[2];

    const dedupKey = `${userId}|${questId}`;
    if (inflightRef.current.has(dedupKey)) return;
    inflightRef.current.add(dedupKey);

    const { error } = await supabase.rpc('award_qr_quest', {
      p_user_id: userId,
      p_quest_id: questId
    });

    if (error) {
      const dup = /already received/i.test(error.message);
      addEntry({
        at: Date.now(),
        status: dup ? 'dup' : 'err',
        message: dup ? `${name} — already scanned` : error.message,
        userId,
        name
      });
    } else {
      addEntry({
        at: Date.now(),
        status: 'ok',
        message: `+${selectedQuest?.points ?? 0} pts → ${name}`,
        userId,
        name
      });
      router.refresh();
    }

    setTimeout(() => inflightRef.current.delete(dedupKey), 2000);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-purple px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={logout} className="absolute top-[18px] right-4 bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconLogout size={12} />Logout
        </button>
        <div className="text-[21px] font-black flex items-center gap-2 mb-0.5"><IconQrcode size={22} />Scan QR</div>
        <div className="text-xs opacity-80 font-semibold">Scan a user&apos;s QR to award a quest</div>
      </div>

      <div className="px-3.5 pt-3.5">
        <div className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wide mb-1">Quest to award</div>
        {quests.length === 0 ? (
          <div className="bg-[#fffaf0] border-[1.5px] border-[#ffc875] rounded-[11px] p-3 flex items-center gap-2 text-xs font-bold text-[#7a4d0c]">
            <IconAlertTriangle size={16} />No active QR quests. Create one first.
          </div>
        ) : (
          <select
            value={questId}
            onChange={(e) => setQuestId(e.target.value)}
            disabled={scanning}
            className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple disabled:opacity-60"
          >
            {quests.map((q) => (
              <option key={q.id} value={q.id}>{q.title} (+{q.points} pts)</option>
            ))}
          </select>
        )}

        <div className="mt-3.5">
          <div id={SCANNER_ID} className={`w-full rounded-[13px] overflow-hidden bg-black ${scanning ? 'min-h-[260px]' : 'h-0'}`} />
        </div>

        {!scanning ? (
          <button
            onClick={() => setScanning(true)}
            disabled={!questId}
            className="w-full bg-brand-purple text-white text-sm font-extrabold py-3 rounded-xl mt-3.5 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <IconCameraRotate size={16} />Start camera
          </button>
        ) : (
          <button
            onClick={() => setScanning(false)}
            className="w-full bg-brand-coral text-white text-sm font-extrabold py-3 rounded-xl mt-3.5 flex items-center justify-center gap-1.5"
          >
            <IconPlayerStop size={16} />Stop
          </button>
        )}
      </div>

      <div className="px-3.5 pt-3.5 pb-3 flex-1">
        <div className="text-sm font-extrabold text-brand-purple mb-2">Recent scans</div>
        {history.length === 0 ? (
          <div className="text-center py-6 text-brand-muted font-bold text-xs">
            Point the camera at a user&apos;s QR — results show here.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {history.map((h, i) => (
              <div
                key={i}
                className={`rounded-[11px] px-3 py-2 border-[1.5px] flex items-center gap-2 ${
                  h.status === 'ok' ? 'bg-brand-teal-bg border-brand-teal text-brand-teal'
                  : h.status === 'dup' ? 'bg-[#fffaf0] border-[#ffc875] text-[#7a4d0c]'
                  : 'bg-brand-coral-bg border-brand-coral text-brand-coral'
                }`}
              >
                {h.status === 'ok' ? <IconCheck size={14} />
                 : h.status === 'dup' ? <IconAlertTriangle size={14} />
                 : <IconX size={14} />}
                <div className="text-[11px] font-extrabold flex-1">{h.message}</div>
                <div className="text-[10px] font-bold opacity-70">
                  {new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
