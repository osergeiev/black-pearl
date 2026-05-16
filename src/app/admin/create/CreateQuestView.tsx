'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  IconCirclePlus, IconCamera, IconQrcode, IconBolt, IconCalendarEvent,
  IconUserStar, IconDeviceFloppy, IconX
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';

const ICONS = [
  { value: 'ti-wave-saw-tool', label: 'Beach / water' },
  { value: 'ti-coffee', label: 'Coffee / cafe' },
  { value: 'ti-shopping-bag', label: 'Shopping / market' },
  { value: 'ti-camera', label: 'Photo / report' },
  { value: 'ti-bus', label: 'Transit' },
  { value: 'ti-heart-handshake', label: 'Community' },
  { value: 'ti-trash', label: 'Cleanup' },
  { value: 'ti-tree', label: 'Nature' },
  { value: 'ti-calendar-event', label: 'Event' }
];

export function CreateQuestView() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pts, setPts] = useState(50);
  const [icon, setIcon] = useState(ICONS[0].value);
  const [proofType, setProofType] = useState<'photo' | 'qr'>('photo');
  const [qrMethod, setQrMethod] = useState<'auto' | 'event' | 'organizer'>('auto');
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function generateEventQr() {
    const eventId = 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const data = qrMethod === 'auto' ? `SPLITSKI:AUTO:${eventId}`
      : qrMethod === 'event' ? `SPLITSKI:EVENT:${eventId}:${title || 'New event'}`
      : `SPLITSKI:ORG:${eventId}:${title || 'New event'}`;
    setGeneratedQr(data);
  }

  async function save() {
    if (!title.trim() || !desc.trim()) { alert('Fill in title and description!'); return; }
    setSaving(true);
    const { error } = await supabase.from('quests').insert({
      title, description: desc, icon, points: pts, proof_type: proofType,
      image_url: imageUrl.trim() || null,
      qr_method: proofType === 'qr' ? qrMethod : null,
      qr_data: proofType === 'qr' ? generatedQr : null,
      active: true
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    router.push('/admin/quests');
    router.refresh();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-purple px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={() => router.push('/admin/quests')} className="absolute top-[18px] right-4 bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconX size={12} />Close
        </button>
        <div className="text-[21px] font-black flex items-center gap-2 mb-0.5"><IconCirclePlus size={22} />New quest</div>
        <div className="text-xs opacity-80 font-semibold">Create a quest for users</div>
      </div>

      <div className="px-3.5 pb-3.5">
        <Label>Quest title</Label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Visit Marjan and pick up trash"
               className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple" />

        <Label>Description</Label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="short description of what to do"
               className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple" />

        <Label>Image URL (optional)</Label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..."
               className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple" />
        {imageUrl.trim() && (
          <div className="w-full h-28 rounded-[11px] overflow-hidden mt-2 bg-brand-beige">
            <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-1.5">
          <div>
            <Label>Points</Label>
            <input type="number" value={pts} onChange={(e) => setPts(parseInt(e.target.value) || 0)}
                   className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple" />
          </div>
          <div>
            <Label>Icon</Label>
            <select value={icon} onChange={(e) => setIcon(e.target.value)}
                    className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple">
              {ICONS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
        </div>

        <Label>Proof type</Label>
        <div className="flex gap-1.5 bg-[#f4f1ea] rounded-xl p-1 mt-1">
          <TabBtn active={proofType === 'photo'} onClick={() => setProofType('photo')}><IconCamera size={12} />Photo + admin</TabBtn>
          <TabBtn active={proofType === 'qr'} onClick={() => setProofType('qr')}><IconQrcode size={12} />QR scan</TabBtn>
        </div>

        {proofType === 'qr' && (
          <div className="mt-3.5">
            <Label>How is the QR code created?</Label>
            <div className="flex flex-col gap-1.5 bg-[#f4f1ea] rounded-xl p-1.5 mt-1">
              <StackBtn active={qrMethod === 'auto'} onClick={() => setQrMethod('auto')}><IconBolt size={12} />Auto (unique ID per user)</StackBtn>
              <StackBtn active={qrMethod === 'event'} onClick={() => setQrMethod('event')}><IconCalendarEvent size={12} />Per-event (shared QR)</StackBtn>
              <StackBtn active={qrMethod === 'organizer'} onClick={() => setQrMethod('organizer')}><IconUserStar size={12} />Per-organizer (scans users)</StackBtn>
            </div>
            <button onClick={generateEventQr}
                    className="w-full bg-brand-purple text-white text-sm font-extrabold py-3 rounded-xl mt-2.5 flex items-center justify-center gap-1.5">
              <IconQrcode size={16} />Generate event QR
            </button>
            {generatedQr && (
              <div className="bg-white rounded-[14px] p-3.5 border-[1.5px] border-brand-beige text-center mt-3">
                <div className="text-[13px] font-extrabold text-[#1a1a1a] mb-0.5">{title || 'New event'}</div>
                <div className="text-[11px] text-brand-muted font-bold mb-2.5">Scan to register participants</div>
                <div className="flex justify-center py-2.5"><QRCodeSVG value={generatedQr} size={170} level="L" /></div>
                <div className="text-[9px] text-[#b0a898] font-bold mt-2 font-mono break-all">{generatedQr}</div>
              </div>
            )}
          </div>
        )}

        <button onClick={save} disabled={saving}
                className="w-full bg-brand-purple text-white text-sm font-extrabold py-3 rounded-xl mt-[18px] flex items-center justify-center gap-1.5 disabled:opacity-60">
          <IconDeviceFloppy size={16} />{saving ? 'Saving...' : 'Save quest'}
        </button>
        <button onClick={() => router.push('/admin/quests')} className="w-full text-brand-muted text-xs font-bold py-2">Cancel</button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wide mt-2.5 mb-1">{children}</div>;
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex-1 py-2 text-[10px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition-colors ${
      active ? 'bg-brand-purple text-white' : 'text-brand-muted'
    }`}>{children}</button>
  );
}

function StackBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-2.5 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition-colors text-left ${
      active ? 'bg-brand-purple text-white' : 'text-brand-muted'
    }`}>{children}</button>
  );
}
