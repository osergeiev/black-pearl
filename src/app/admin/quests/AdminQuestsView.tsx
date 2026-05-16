'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconListCheck, IconPlus, IconTrash, IconCamera, IconQrcode,
  IconStarFilled, IconLogout
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';
import type { Quest } from '@/types';

export function AdminQuestsView({ quests: initial }: { quests: Quest[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [quests, setQuests] = useState(initial);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm('Delete this quest?')) return;
    const { error } = await supabase.from('quests').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setQuests(quests.filter((q) => q.id !== id));
    router.refresh();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-purple px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={logout} className="absolute top-[18px] right-4 bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconLogout size={12} />Logout
        </button>
        <div className="text-[21px] font-black flex items-center gap-2 mb-0.5"><IconListCheck size={22} />Quests</div>
        <div className="text-xs opacity-80 font-semibold">Manage your quests</div>
      </div>

      <Link href="/admin/create" className="mx-3.5 my-3.5 bg-brand-purple text-white text-[13px] font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5">
        <IconPlus size={16} />New quest
      </Link>

      <div className="px-3.5 pb-1.5 flex items-center justify-between">
        <div className="text-sm font-extrabold text-brand-purple">Active quests</div>
        <div className="text-[11px] text-brand-muted font-bold">{quests.length} active</div>
      </div>

      <div className="px-3.5 pb-3 flex flex-col gap-2">
        {quests.map((q) => (
          <div key={q.id} className="bg-white rounded-[13px] p-3 flex items-center gap-2.5 border-[1.5px] border-brand-beige">
            <div className="w-[58px] h-[58px] rounded-[11px] bg-brand-beige flex items-center justify-center flex-shrink-0 text-brand-green overflow-hidden">
              {q.image_url ? (
                <img src={q.image_url} alt={q.title} className="w-full h-full object-cover" />
              ) : (
                <i className={`ti ${q.icon}`} style={{ fontSize: 24 }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-[#1a1a1a] mb-px leading-tight">{q.title}</div>
              <div className="text-[10px] text-brand-muted font-semibold leading-tight">{q.description}</div>
              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-1 ${
                q.proof_type === 'qr' ? 'bg-brand-teal-bg text-brand-teal' : 'bg-[#EAF2FF] text-brand-blue'
              }`}>
                {q.proof_type === 'qr' ? <><IconQrcode size={11} />QR scan</> : <><IconCamera size={11} />Photo + admin</>}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="text-xs font-black text-brand-amber flex items-center gap-0.5">
                <IconStarFilled size={11} className="text-brand-amber" />+{q.points}
              </div>
              <button onClick={() => del(q.id)} className="bg-brand-coral text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                <IconTrash size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
