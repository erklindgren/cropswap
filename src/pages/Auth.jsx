import { useState } from 'react';
import { Sprout } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';

export default function Auth({ onAuth }) {
  const [mode, setMode]       = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [form, setForm]       = useState({ email: '', password: '', displayName: '', location: '' });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn({ email: form.email, password: form.password });
      } else {
        if (!form.displayName) { setError('Display name is required.'); setLoading(false); return; }
        await signUp({ email: form.email, password: form.password, displayName: form.displayName, locationLabel: form.location });
      }
      onAuth();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-moss-600 flex items-center justify-center mx-auto mb-4 shadow-card">
            <Sprout size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-stone-800">Duluth <span className="text-moss-600">Crop Swap</span></h1>
          <p className="text-stone-400 text-sm mt-1 italic">Share your garden. Build your community.</p>
        </div>

        <div className="card p-6">
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5">
            {[['signin', 'Sign In'], ['signup', 'Join']].map(([k, label]) => (
              <button key={k} onClick={() => { setMode(k); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === k ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Your name</label>
                  <input className="input" placeholder="e.g. Erik Lindgren" value={form.displayName} onChange={e => f('displayName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Neighborhood <span className="text-stone-400 font-normal">(optional)</span></label>
                  <input className="input" placeholder="e.g. Park Point, Duluth MN" value={form.location} onChange={e => f('location', e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => f('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => f('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            {error && (
              <div className="bg-clay-50 border border-clay-100 text-clay-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            {mode === 'signup' && (
              <div className="bg-moss-50 border border-moss-100 rounded-xl p-3 text-xs text-moss-700 leading-relaxed">
                New members receive 10 welcome credits from the Community Reserve   enough to make your first trade before you've given anything.
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : mode === 'signin' ? 'Sign In' : 'Join the Collective'
              }
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-stone-400 mt-4">
          A free community project by <span className="text-moss-600">Uppfinna, Inc.</span>
        </p>
      </div>
    </div>
  );
}
