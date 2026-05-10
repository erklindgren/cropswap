import { useState } from 'react';
import { Sprout, ArrowRight, Leaf, ArrowRightLeft, Heart } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';

function AboutPanel({ onBack }) {
  return (
    <div className="w-full max-w-lg mx-auto page-enter">
      <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm mb-6 transition-colors">
        <ArrowRight size={14} className="rotate-180" /> Back to sign in
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-moss-600 flex items-center justify-center mx-auto mb-4 shadow-card">
          <Sprout size={26} className="text-white" />
        </div>
        <h1 className="font-display text-3xl text-stone-800 mb-2">Duluth Crop Swap</h1>
        <p className="text-stone-500 leading-relaxed">A neighborhood produce exchange built on trust, not money.</p>
      </div>

      <div className="card p-5 mb-4">
        <p className="text-stone-700 leading-relaxed mb-4">
          Every summer, Duluth gardens produce more than any one household can eat. Zucchini overtakes the counter. Tomatoes ripen faster than you can use them. Meanwhile, a neighbor two blocks over is wishing they had fresh garlic or a jar of honey.
        </p>
        <p className="text-stone-700 leading-relaxed">
          Crop Swap is a simple way to fix that. Share what you grow. Receive what you need. No money changes hands. Just neighbors trading abundance through a fair credit system proven in communities worldwide for over 40 years.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-5">
        {[
          { icon: Leaf,            title: 'List what you have',    desc: 'Post surplus from your garden with a photo and best-by date. Your neighbors can see it immediately.' },
          { icon: ArrowRightLeft,  title: 'Trade fairly',          desc: 'Request a swap with produce of equal value. Credits are held in escrow until you meet in person and confirm.' },
          { icon: Heart,           title: 'Build community',       desc: 'Follow growers you trust. Donate surplus to the community pantry. Help neighbors in need without anyone having to ask.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3 items-start p-4 bg-stone-50 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-moss-100 flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-moss-700" />
            </div>
            <div>
              <div className="font-medium text-stone-800 text-sm mb-0.5">{title}</div>
              <div className="text-stone-500 text-xs leading-relaxed">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-moss-50 border border-moss-100 rounded-2xl p-4 mb-6 text-center">
        <div className="text-moss-800 font-medium text-sm mb-1">Free to join. Always.</div>
        <div className="text-moss-700 text-xs leading-relaxed">New members receive 10 welcome credits from the Community Reserve, enough to make your first trade before you have given a thing.</div>
      </div>

      <button onClick={onBack}
        className="btn-primary w-full flex items-center justify-center gap-2">
        Join the Collective <ArrowRight size={15} />
      </button>

      <p className="text-center text-xs text-stone-400 mt-4">
        A free community project by <span className="text-moss-600 font-medium">Uppfinna, Inc.</span>
      </p>
    </div>
  );
}

export default function Auth({ onAuth }) {
  const [mode, setMode]       = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [form, setForm]       = useState({ email:'', password:'', displayName:'', location:'' });
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

  if (showAbout) {
    return (
      <div className="min-h-screen bg-cream flex items-start justify-center p-6 pt-12">
        <AboutPanel onBack={() => { setShowAbout(false); setMode('signup'); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-moss-600 flex items-center justify-center mx-auto mb-4 shadow-card">
            <Sprout size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-stone-800">
            Duluth <span className="text-moss-600">Crop Swap</span>
          </h1>
          <p className="text-stone-400 text-sm mt-1">Share your garden. Build your community.</p>
        </div>

        {/* Tagline card */}
        <div className="bg-moss-50 border border-moss-100 rounded-2xl px-4 py-3 mb-5 text-center">
          <p className="text-moss-800 text-sm leading-relaxed">
            A free neighborhood produce exchange where gardens share abundance and neighbors grow closer. No money, just trust.
          </p>
          <button onClick={() => setShowAbout(true)}
            className="mt-2 text-xs text-moss-600 hover:text-moss-800 font-medium flex items-center gap-1 mx-auto transition-colors">
            Learn how it works <ArrowRight size={12} />
          </button>
        </div>

        {/* Auth card */}
        <div className="card p-6">
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5">
            {[['signin','Sign In'],['signup','Join']].map(([k, label]) => (
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
                  <input className="input" placeholder="e.g. Erik Lindgren"
                    value={form.displayName} onChange={e => f('displayName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Neighborhood <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input className="input" placeholder="e.g. Park Point, Duluth MN"
                    value={form.location} onChange={e => f('location', e.target.value)} />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => f('email', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => f('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            {error && (
              <div className="bg-clay-50 border border-clay-100 text-clay-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-500 leading-relaxed">
                New members receive 10 welcome credits from the Community Reserve to make your first trade.
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
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
