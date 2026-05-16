'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { SheepSvg } from '@/components/SheepSvg';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('marko@splitski.app');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('Marko Perić');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      const { error: e1 } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (e1) { setError(e1.message); setLoading(false); return; }
    } else {
      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      if (e2) { setError(e2.message); setLoading(false); return; }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Login failed'); setLoading(false); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    router.push(profile?.role === 'admin' ? '/admin' : '/home');
    router.refresh();
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-brand-green to-brand-green-light flex flex-col items-center justify-center p-7 text-white">
      <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-3.5">
        <SheepSvg size={60} />
      </div>
      <div className="text-[34px] font-black mb-1 -tracking-tight">Splitski</div>
      <div className="text-xs opacity-85 font-bold mb-7">Feed the sheep, fix the city</div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-[22px] w-full text-[#1a1a1a] shadow-xl"
      >
        {mode === 'signup' && (
          <>
            <div className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wide mb-1.5">
              Full name
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-sm font-bold text-[#1a1a1a] bg-brand-cream mb-3.5 outline-none focus:border-brand-green"
            />
          </>
        )}

        <div className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wide mb-1.5">
          Email
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-sm font-bold text-[#1a1a1a] bg-brand-cream mb-3.5 outline-none focus:border-brand-green"
        />

        <div className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wide mb-1.5">
          Password
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-[1.5px] border-brand-beige-dark rounded-xl px-3 py-2.5 text-sm font-bold text-[#1a1a1a] bg-brand-cream mb-3.5 outline-none focus:border-brand-green"
        />

        {error && (
          <div className="text-[#a83232] text-xs font-bold mb-2 text-center bg-[#faebec] p-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-green text-white text-[15px] font-extrabold py-3 rounded-xl mt-1.5 disabled:opacity-60"
        >
          {loading ? 'Loading...' : mode === 'signup' ? 'Sign up' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
          className="w-full text-brand-muted text-[11px] font-bold mt-3"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
