'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconGift, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';

const ICONS = [
  { value: 'ti-gift', label: 'Gift' },
  { value: 'ti-coffee', label: 'Coffee / cafe' },
  { value: 'ti-shopping-bag', label: 'Shopping / market' },
  { value: 'ti-tools-kitchen-2', label: 'Restaurant' },
  { value: 'ti-building-monument', label: 'Museum / culture' },
  { value: 'ti-ticket', label: 'Ticket / event' },
  { value: 'ti-tag', label: 'Discount' }
];

export function CreateRewardView() {
  const router = useRouter();
  const supabase = createClient();
  const [business, setBusiness] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [cost, setCost] = useState(200);
  const [icon, setIcon] = useState(ICONS[0].value);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!business.trim() || !title.trim()) { alert('Fill in business and title!'); return; }
    if (cost <= 0) { alert('Cost must be positive!'); return; }
    setSaving(true);
    const { error } = await supabase.from('rewards').insert({
      business: business.trim(),
      title: title.trim(),
      description: desc.trim() || null,
      icon,
      image_url: imageUrl.trim() || null,
      cost,
      active: true
    });
    setSaving(false);
    if (error) { alert(error.message); return; }
    router.push('/admin/rewards');
    router.refresh();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-purple px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={() => router.push('/admin/rewards')} className="absolute top-[18px] right-4 bg-white/20 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconX size={12} />Close
        </button>
        <div className="text-[21px] font-black flex items-center gap-2 mb-0.5"><IconGift size={22} />New reward</div>
        <div className="text-xs opacity-80 font-semibold">Add a partner reward to the catalog</div>
      </div>

      <div className="px-3.5 pb-3.5">
        <Label>Business name</Label>
        <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="e.g. Konoba Fetivi"
               className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple" />

        <Label>Reward title</Label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Free coffee + burek"
               className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple" />

        <Label>Description (optional)</Label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Show this code at the counter"
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
            <Label>Cost (pts)</Label>
            <input type="number" value={cost} onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                   className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple" />
          </div>
          <div>
            <Label>Icon (fallback)</Label>
            <select value={icon} onChange={(e) => setIcon(e.target.value)}
                    className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-[13px] font-bold bg-white outline-none focus:border-brand-purple">
              {ICONS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
        </div>

        <button onClick={save} disabled={saving}
                className="w-full bg-brand-purple text-white text-sm font-extrabold py-3 rounded-xl mt-[18px] flex items-center justify-center gap-1.5 disabled:opacity-60">
          <IconDeviceFloppy size={16} />{saving ? 'Saving...' : 'Save reward'}
        </button>
        <button onClick={() => router.push('/admin/rewards')} className="w-full text-brand-muted text-xs font-bold py-2">Cancel</button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wide mt-2.5 mb-1">{children}</div>;
}
