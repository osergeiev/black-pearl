'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCamera, IconSend, IconX, IconClockHour4 } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-client';
import type { Quest } from '@/types';

export function ProofForm({ quest }: { quest: Quest }) {
  const router = useRouter();
  const supabase = createClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function submit() {
    if (!file) return;
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not signed in'); setSubmitting(false); return; }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('proof-photos').upload(path, file);
    if (upErr) { setError(upErr.message); setSubmitting(false); return; }
    const { data: pub } = supabase.storage.from('proof-photos').getPublicUrl(path);

    const { error: insErr } = await supabase.from('requests').insert({
      user_id: user.id,
      quest_id: quest.id,
      photo_url: pub.publicUrl,
      status: 'pending'
    });
    if (insErr) { setError(insErr.message); setSubmitting(false); return; }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <div className="bg-brand-green px-[18px] py-5 text-white flex-shrink-0 relative">
          <button onClick={() => router.push('/home')} className="absolute top-[18px] right-4 bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
            <IconX size={12} />Close
          </button>
          <div className="text-[21px] font-black mb-0.5">Submitted!</div>
          <div className="text-xs opacity-80 font-semibold">Your request is on its way</div>
        </div>
        <div className="p-3">
          <div className="bg-[#fffaf0] border-[1.5px] border-[#ffc875] rounded-[13px] p-[18px] text-center mb-3">
            <IconClockHour4 size={42} className="text-[#a85e0c] mx-auto mb-1.5" />
            <div className="text-[15px] font-black mb-1">Submitted for review!</div>
            <div className="text-[11px] text-brand-muted font-semibold leading-relaxed">
              Admin will review your request soon. You&apos;ll receive points once it&apos;s approved.
            </div>
          </div>
          {preview && (
            <div className="w-full rounded-[11px] overflow-hidden h-40 mb-3">
              <img src={preview} alt="submitted" className="w-full h-full object-cover" />
            </div>
          )}
          <button onClick={() => { router.push('/home'); router.refresh(); }} className="w-full bg-brand-green text-white text-sm font-extrabold py-3 rounded-xl">
            Back to quests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="bg-brand-green px-[18px] py-5 text-white flex-shrink-0 relative">
        <button onClick={() => router.push('/home')} className="absolute top-[18px] right-4 bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <IconX size={12} />Close
        </button>
        <div className="text-[21px] font-black mb-0.5">{quest.title}</div>
        <div className="text-xs opacity-80 font-semibold">Submit a photo for admin approval</div>
      </div>

      <div className="p-3">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} />
        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-[#c8e6c9] rounded-[13px] py-6 px-3.5 text-center cursor-pointer bg-brand-green-bg mb-3"
          >
            <IconCamera size={38} className="text-brand-green mx-auto mb-1.5" />
            <div className="text-[13px] font-extrabold text-brand-green">Take or upload a photo</div>
            <div className="text-[10px] text-brand-muted font-semibold mt-0.5">
              Receipt, food, location — whatever proves it
            </div>
          </div>
        ) : (
          <div className="w-full rounded-[11px] overflow-hidden h-40 mb-3">
            <img src={preview} alt="proof" className="w-full h-full object-cover" />
          </div>
        )}

        {error && <div className="text-[#a83232] text-xs font-bold mb-2 text-center bg-[#faebec] p-2 rounded-lg">{error}</div>}

        <button
          onClick={submit}
          disabled={!file || submitting}
          className="w-full bg-brand-green text-white text-sm font-extrabold py-3 rounded-xl mb-1.5 disabled:bg-[#b0a898] flex items-center justify-center gap-1.5"
        >
          <IconSend size={16} />
          {submitting ? 'Submitting...' : 'Submit to admin'}
        </button>
        <button onClick={() => router.push('/home')} className="w-full text-brand-muted text-xs font-bold py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}
